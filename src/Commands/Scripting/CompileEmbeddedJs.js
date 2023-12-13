'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
// const jsongin = require( '@liquicode/jsongin' )();

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$CompileEmbeddedJs',
		CommandHelp: `$CompileEmbeddedJs:
Processes a document file or string containing Embedded Javascript (ejs) code.
The return value of this command is a string of Javascript code that, when executed, will return the processed document.
This is a text based process and should work on any text based document (e.g. html, md).

Supports the following operators:
<%=
<%-
<%_
_%>
<%.

Difference from real ejs (https://github.com/mde/ejs):
- Executes ejs code using "require()" rather than "eval()".
  This approach is much less safe but it does give you full flexibility within your ejs code.
  For example, you can access any nodejs library by require'ing it in your ejs code.
- Introduces a new ejs operator "<%." which marks the entire rest of the line as ejs code and does not require an ending "%>"

Fields:
- embedded_js_start: Token to delineate the beginning of an embedded js section. Defaults to "<%", set to empty to disable embedded js.
- embedded_js_end: Token to delineate the end of an embedded js section. Defaults to "%>".
- escape_html: Enable html escaping. Defaults to false.
- code_file: The path to an ejs file to load and execute.
- code_string: A string of ejs code to execute. Either this or code_file should be used.
- use_eval: Forces the processor to revert back to using "eval()" for code execution.
- out_file: Filename to store the text of the processed document.
- out_context: Context variable to store the text of the processed document.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.embedded_js_start === 'undefined' ) { Step.embedded_js_start = '<%'; }
			if ( typeof Step.embedded_js_end === 'undefined' ) { Step.embedded_js_end = '%>'; }
			if ( typeof Step.escape_html === 'undefined' ) { Step.escape_html = false; }
			if ( !Step.code_file && !Step.code_string ) { throw new Error( `${Command.CommandName}: One of "code_file" or "code_string" should be defined.` ); }
			if ( Step.code_file && Step.code_string ) { throw new Error( `${Command.CommandName}: Only one of "code_file" and "code_string" should be defined.` ); }
			if ( typeof Step.use_eval === 'undefined' ) { Step.use_eval = false; }
			if ( typeof Step.out_file === 'undefined' ) { Step.out_file = ''; }
			if ( typeof Step.out_context === 'undefined' ) { Step.out_context = ''; }

			// Get the code string.
			let code_string = null;
			if ( Step.code_file )
			{
				let path = Engine.ResolvePath( Context, Step.code_file );
				if ( !LIB_FS.existsSync( path ) ) { throw new Error( `${Command.CommandName}: The code file [${path}] does not exist.` ); }
				code_string = LIB_FS.readFileSync( path, 'utf8' );
			}
			else
			{
				code_string = Engine.ResolveString( Context, Step.code_string );
			}

			// Parse the document.
			let result = 'let __ = ``;\n';
			let ich = 0;
			while ( ich < code_string.length )
			{
				let ich1 = code_string.indexOf( Step.embedded_js_start, ich );
				if ( ich1 < 0 )
				{
					result += '__ += `' + code_string.substring( ich ) + '`;\n';
					ich = code_string.length;
					break;
				}
				result += '__ += `' + code_string.substring( ich, ich1 ) + '`;\n';
				ich = ich1;
				ich1 = code_string.indexOf( Step.embedded_js_end, ich );
				if ( ich1 < 0 ) { ich1 = code_string.length; }
				result += '__ += `' + code_string.substring( ich, ich1 ) + '`;\n';
				ich = ich1 + Step.embedded_js_end.length;
			}
			result += '\nreturn __;\n';

			// Execute the document.



			// Store the result in a file.
			if ( Step.out_file )
			{
				LIB_FS.writeFileSync( Step.out_file, result );
			}

			// Store the result in the Context.
			if ( Step.out_context )
			{
				Engine.Loose.SetObjectValue( Context, Step.out_context, result );
			}

			// Return true
			return true;
		},


	};

	// Return the command.
	return Command;
};
