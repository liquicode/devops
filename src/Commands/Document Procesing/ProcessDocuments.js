'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
// const jsongin = require( '@liquicode/jsongin' )();

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

Difference from real ejs (https://github.com/mde/ejs):
- Executes ejs code using "require()" rather than "eval()".
  This approach is much less safe but it does give you full flexibility within your ejs code.
  For example, you can access any nodejs library by require'ing it in your ejs code.
- Introduces a new ejs operator "<%." which marks the entire rest of the line as ejs code and does not require an ending "%>"

Fields:
- context: The Context variable containing an array of content objects returned from ScanDocuments().
- output_path: The path to generate files into.
- include_path: The path to js files to load when executing embedded js. Defaults to empty.
- embedded_js_start: Token to delineate the beginning of an embedded js section. Defaults to "<%", set to empty to disable embedded js.
- embedded_js_end: Token to delineate the end of an embedded js section. Defaults to "%>".
- downgrade_eval: Forces the processor to revert back to using "eval()" for ejs execution.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field is required.` ); }
			if ( typeof Step.context !== 'string' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must be a string.` ); }
			if ( typeof Step.output_path === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "output_path" field is required.` ); }
			if ( typeof Step.include_path === 'undefined' ) { Step.include_path = ''; }
			if ( typeof Step.embedded_js_start === 'undefined' ) { Step.embedded_js_start = '<%'; }
			if ( typeof Step.embedded_js_end === 'undefined' ) { Step.embedded_js_end = '%>'; }

			let output_path = Engine.ResolvePath( Context, Step.output_path );
			let include_path = Engine.ResolvePath( Context, Step.include_path );

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
			let execution_template = 'module.exports = function( Context, Documents, Output ) {\n';
			if ( include_path )
			{
				if ( LIB_FS.existsSync( include_path ) )
				{
					LIB_FS.readdirSync( include_path ).forEach(
						function ( filename )
						{
							if ( LIB_PATH.extname( filename ) === '.js' )
							{
								let path = LIB_PATH.join( include_path, filename );
								let script = LIB_FS.readFileSync( path, 'utf8' );
								execution_template += '\n// Include From: ' + path + '\n';
								execution_template += script + '\n';
							}
						} );
				}
			}

			// Prepare the output folder.
			if ( LIB_FS.existsSync( output_path ) )
			{
				LIB_FS.rmSync( output_path, { recursive: true, force: true } );
				// LIB_FS.rmdirSync( output_path, { recursive: true, force: true } );
			}
			LIB_FS.mkdirSync( output_path, { recursive: true } );

			// Process each document.
			let document_count = 0;
			for ( let document_index = 0; document_index < Documents.length; document_index++ )
			{
				let document = Documents[ document_index ];
				if ( !document.content ) { continue; }
				Output.path = LIB_PATH.join( output_path, document.path );
				if ( !LIB_FS.existsSync( LIB_PATH.dirname( Output.path ) ) )
				{
					let folder = LIB_PATH.dirname( Output.path );
					LIB_FS.mkdirSync( folder, { recursive: true } );
				}
				let content = document.content;
				while ( content.indexOf( Step.embedded_js_start ) >= 0 )
				{
					let ich = content.indexOf( Step.embedded_js_start );
					Output.print( content.substr( 0, ich ) );
					content = content.substr( ich + Step.embedded_js_start.length );
					let is_inline = false;
					if ( content.startsWith( Step.embedded_js_immediate ) )
					{
						is_inline = true;
						content = content.substr( Step.embedded_js_immediate.length );
					}
					content = content.trim();
					ich = content.indexOf( Step.embedded_js_end );
					if ( ich < 0 ) { ich = content.length; }
					let script = execution_template;
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
					require( script_filename )( Context, Documents, Output );
					LIB_FS.unlinkSync( script_filename );
					content = content.substr( ich + Step.embedded_js_end.length );
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
