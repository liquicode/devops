'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const jsongin = require( '@liquicode/jsongin' )();

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$LoadDocuments',
		CommandHelp: `$LoadDocuments:
Scans document (text) files in a path, loading any front-matter and content into an array of content objects.
Front-matter is an object definition embedded within a document and appears at the start of the document.
Each content object contains the path of a file, any front-matter contained within the file, and the remaining text content of the file.

Fields:
- context: The context variable to store the array of content objects.
- path: The path of files to read.
- extensions: Array of file extensions (e.g. '.txt') to include. Leave empty for all files.
- front_matter_start: Token to delineate the beginning of front-matter section. Defaults to "---", set to empty to disable front-matter scanning.
- front_matter_end: Token to delineate the end of front-matter section. Defaults to "---".
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `The "context" field is required.` ); }
			if ( typeof Step.context !== 'string' ) { throw new Error( `The "context" field must be a string.` ); }
			if ( typeof Step.path === 'undefined' ) { throw new Error( `The "path" field is required.` ); }
			if ( typeof Step.extensions === 'undefined' ) { Step.extensions = []; }
			if ( typeof Step.front_matter_start === 'undefined' ) { Step.front_matter_start = '---'; }
			if ( typeof Step.front_matter_end === 'undefined' ) { Step.front_matter_end = '---'; }

			let Contents = [];
			let src_path = Engine.ResolvePath( Context, Step.path );
			scan_docs_recursive( src_path );

			function scan_docs_recursive( path )
			{
				let exists = LIB_FS.existsSync( path );
				let stats = exists && LIB_FS.statSync( path );
				let is_folder = exists && stats.isDirectory();
				if ( is_folder )
				{
					LIB_FS.readdirSync( path ).forEach( function ( child_name )
					{
						scan_docs_recursive( LIB_PATH.join( path, child_name ) );
					} );
				}
				else
				{
					let extension = LIB_PATH.extname( path );
					if ( Step.extensions.length && !Step.extensions.includes( extension ) )
					{
						// Ignore files not having a listed extension.
						return;
					}

					let document = {};

					// Load document content.
					let content = LIB_FS.readFileSync( path, 'utf8' );
					content = content.trim();

					// Extract front-matter.
					if ( Step.front_matter_start && content.startsWith( Step.front_matter_start ) )
					{
						let ich = Step.front_matter_start.length;
						ich = content.indexOf( Step.front_matter_end );
						if ( ich < 0 ) { ich = content.length; }
						let json = content.substring( 0, ich );
						document = jsongin.Parse( json );
						content = content.substring( ich + Step.front_matter_end.length );
					}

					document.path = path.substring( src_path.length );
					document.content = content;
					Contents.push( document );
				}
			};

			let result = Engine.jsongin.SetValue( Context, Step.context, Contents );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
