'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const jsongin = require( '@liquicode/jsongin' )();

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ProcessDocuments',
		CommandHelp: `$ProcessDocuments:
Processes scanned documents returned from ScanDocuments() and generates the output to a folder.
Document content can contain embedded javascript code which can query and manipulate the Task Context.
Javascript code contained in the "functions" folder will be inserted into the execution pipeline of embedded code.

Scans document (text) files in a path, loading any front-matter and content into an array of content objects.
Front-matter is an object definition embedded within a document and appears at the start of the document.
Each content object contains the path of a file, any front-matter contained within the file, and the remaining text content of the file.
Fields:
- context: The Context variable containing an array of content objects returned from ScanDocuments().
- output_path: The path to generate files into.
- include_path: The path to js files to load when executing embedded js. Defaults to empty.
- embedded_js_start: Token to dileate the beginning of an embedded js section. Defaults to "<!-- js", set to empty to disable embedded js.
- embedded_js_immediate: Token to indicate that the code should be executed in immediate mode and its output be inserted into the document.
Must appear directly after the start token. Defaults to "=".
- embedded_js_end: Token to dileate the end of an embedded js section. Defaults to "-->".
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field is required.` ); }
			if ( typeof Step.context !== 'string' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must be a string.` ); }
			if ( typeof Step.output_path === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "output_path" field is required.` ); }
			if ( typeof Step.include_path === 'undefined' ) { Step.include_path = ''; }
			if ( typeof Step.embedded_js_start === 'undefined' ) { Step.embedded_js_start = '<!-- js'; }
			if ( typeof Step.embedded_js_immediate === 'undefined' ) { Step.embedded_js_immediate = '='; }
			if ( typeof Step.embedded_js_end === 'undefined' ) { Step.embedded_js_end = '-->'; }

			// Get the document contents.
			let Documents = Engine.Loose.GetObjectValue( Context, Step.context );

			// Prepare the output controller.
			let Output = {
				path: null,
				print: function ( Text )
				{
					Text = Text || '';
					LIB_FS.appendFileSync( this.path, ( '' + Text ) );
				},
				printline: function ( Text )
				{
					Text = Text || '';
					LIB_FS.appendFileSync( this.path, ( '' + Text + '\n' ) );
				},
			};

			// Prepare the execution context.
			let ExecutionTemplate = 'module.exports = function( jsongin, Documents, Output ) {\n';
			if ( Step.include_path )
			{
				let include_path = Engine.ResolvePath( Context, Step.include_path );
				if ( LIB_FS.existsSync( include_path ) )
				{
					LIB_FS.readdirSync( include_path ).forEach(
						function ( filename )
						{
							if ( LIB_PATH.extname( filename ) === '.js' )
							{
								let path = LIB_PATH.join( include_path, filename );
								let script = LIB_FS.readFileSync( path, 'utf8' );
								ExecutionTemplate += '\n// Include From: ' + path + '\n';
								ExecutionTemplate += script + '\n';
							}
						} );
				}
			}

			// Prepare the output folder.
			if ( LIB_FS.existsSync( OUT_PATH ) )
			{
				LIB_FS.rmSync( OUT_PATH, { recursive: true, force: true } );
				// LIB_FS.rmdirSync( OUT_PATH, { recursive: true, force: true } );
			}
			LIB_FS.mkdirSync( OUT_PATH, { recursive: true } );

			// Process each document.
			let document_count = 0;
			for ( let document_index = 0; document_index < Documents.length; document_index++ )
			{
				let document = Documents[ document_index ];
				if ( !document.content ) { continue; }
				Output.path = LIB_PATH.join( OUT_PATH, document.path );
				if ( !LIB_FS.existsSync( LIB_PATH.dirname( Output.path ) ) )
				{
					let folder = LIB_PATH.dirname( Output.path );
					LIB_FS.mkdirSync( folder, { recursive: true } );
				}
				let content = document.content;
				while ( content.indexOf( EMBEDDED_JS_START ) >= 0 )
				{
					let ich = content.indexOf( EMBEDDED_JS_START );
					Output.print( content.substr( 0, ich ) );
					content = content.substr( ich + EMBEDDED_JS_START.length );
					let is_inline = false;
					if ( content.startsWith( EMBEDDED_JS_IMMEDIATE ) )
					{
						is_inline = true;
						content = content.substr( EMBEDDED_JS_IMMEDIATE.length );
					}
					content = content.trim();
					ich = content.indexOf( EMBEDDED_JS_END );
					if ( ich < 0 ) { ich = content.length; }
					let script = ExecutionTemplate;
					let code = content.substr( 0, ich ).trim();
					if ( is_inline )
					{
						script += `Output.print( ${code} );\n`;
					}
					else
					{
						script += code;
					}
					script += "\n};";
					let script_filename = `${Output.path}.${Math.random()}.js`;
					LIB_FS.writeFileSync( script_filename, script );
					require( script_filename )( jsongin, Documents, Output );
					LIB_FS.unlinkSync( script_filename );
					content = content.substr( ich + EMBEDDED_JS_END.length );
				}
				Output.print( content );
				document_count++;
			}
			return true;
		},


	};

	// Return the command.
	return Command;
};
