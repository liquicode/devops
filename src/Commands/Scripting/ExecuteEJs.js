'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
// const jsongin = require( '@liquicode/jsongin' )();

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ExecuteEjs',
		CommandHelp: `$ExecuteEjs:
Processes a document file or string containing Embedded Javascript (ejs) code.
The return value of this command is a string of Javascript code that, when executed, will return the processed document.
This is a text based process and should work on any text based document (e.g. html, md).

Supports the following operators (from [ejs docs](https://ejs.co/#docs)):
- <%  :'Scriptlet' tag, for control-flow, no output
- <%_ : 'Whitespace Slurping' Scriptlet tag, strips all whitespace before it
- <%= : Outputs the value into the template (HTML escaped)
- <%- : Outputs the unescaped value into the template
- <%# : Comment tag, no execution, no output
- <%% : Outputs a literal '<%'
-  %> : Plain ending tag
- -%> : Trim-mode ('newline slurp') tag, trims following newline
- _%> : 'Whitespace Slurping' ending tag, removes all whitespace after it

Extensions:
- <%* : Treat entire rest of the row as 'Scriptlet'. No closing tag needed.

Difference from real ejs (https://github.com/mde/ejs):
- Executes ejs code using "require()" rather than "eval()".
  This approach is much less safe but it does give you full flexibility within your ejs code.
  For example, you can access any nodejs library by require'ing it in your ejs code.
- Introduces a new ejs operator "<%*" which marks the entire rest of the line as ejs code and does not require an ending "%>"

Fields:
- ejs_start: Token to delineate the beginning of an embedded js section. Defaults to "<%", set to empty to disable embedded js.
- ejs_end: Token to delineate the end of an embedded js section. Defaults to "%>".
- ejs_file: The path to an ejs file to load and execute.
- ejs_string: A string of ejs code to execute. Either this or ejs_file should be used.
- use_eval: Forces the processor to revert back to using "eval()" for code execution.
- script_file: (optional) Filename to write the intermediate document script.
- out_file: Filename to store the output of the processed document.
- out_context: Context variable to store the output of the processed document.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.ejs_start === 'undefined' ) { Step.ejs_start = '<%'; }
			if ( typeof Step.ejs_end === 'undefined' ) { Step.ejs_end = '%>'; }
			if ( !Step.ejs_file && !Step.ejs_string ) { throw new Error( `${Command.CommandName}: One of "ejs_file" or "ejs_string" should be defined.` ); }
			if ( Step.ejs_file && Step.ejs_string ) { throw new Error( `${Command.CommandName}: Only one of "ejs_file" and "ejs_string" should be defined.` ); }
			if ( typeof Step.use_eval === 'undefined' ) { Step.use_eval = false; }
			if ( typeof Step.out_file === 'undefined' ) { Step.out_file = ''; }
			if ( typeof Step.out_context === 'undefined' ) { Step.out_context = ''; }

			// Get the code string.
			let ejs_string = null;
			if ( Step.ejs_file )
			{
				let path = Engine.ResolvePath( Context, Step.ejs_file );
				if ( !LIB_FS.existsSync( path ) ) { throw new Error( `${Command.CommandName}: The code file [${path}] does not exist.` ); }
				ejs_string = LIB_FS.readFileSync( path, 'utf8' );
			}
			else
			{
				ejs_string = Engine.ResolveString( Context, Step.ejs_string );
			}

			// Parse the document into text and code sections.
			let sections = [];
			let ich = 0;
			while ( ich < ejs_string.length )
			{
				// Read up to the next ejs start.
				let ich1 = ejs_string.indexOf( Step.ejs_start, ich );
				if ( ich1 < ich ) 
				{
					// start code not found
					sections.push( {
						type: 'text',
						text: ejs_string.substring( ich ),
					} );
					break;
				}
				else if ( ich1 > ich )
				{
					// start code was found downstream
					sections.push( {
						type: 'text',
						text: ejs_string.substring( ich, ich1 ),
					} );
					ich = ich1;
				}
				else if ( ich1 === ich )
				{
					// start code was found here
					ich += Step.ejs_start.length;
					// check for start code literal
					if ( ejs_string[ ich ] === '%' )
					{
						// literal start code
						sections.push( {
							type: 'text',
							text: Step.ejs_start,
						} );
						ich++;
						continue;
					}
					// get start code modifiers
					let start_modifiers = '';
					for ( let modifier_index = 0; modifier_index < 2; modifier_index++ )
					{
						if ( ich >= ejs_string.length ) { break; }
						if ( ejs_string[ ich ] === ' ' ) { break; }
						if ( '#*=-_'.includes( ejs_string[ ich ] ) ) 
						{
							start_modifiers += ejs_string[ ich ];
							ich++;
						}
					}
					// check to read to end of line
					if ( start_modifiers.includes( '*' ) )
					{
						// read to end of line
						ich1 = ejs_string.indexOf( '\n', ich );
						// ich1 = ejs_string.indexOf( '\r', ich );
						// if ( ich1 < 0 ) { ich1 = ejs_string.indexOf( '\n', ich ); }
						if ( ich1 < 0 ) { ich1 = ejs_string.length; }
						sections.push( {
							type: 'code',
							start_modifiers: start_modifiers,
							end_modifiers: '',
							text: ejs_string.substring( ich, ich1 ),
						} );
						ich = ich1 + 1;
						continue;
					}
					// get end code
					ich1 = ejs_string.indexOf( Step.ejs_end, ich );
					if ( ich1 < 0 ) { ich1 = ejs_string.length; }
					let section = {
						type: 'code',
						start_modifiers: start_modifiers,
						end_modifiers: '',
						text: ejs_string.substring( ich, ich1 ),
					};
					if ( '-_'.includes( section.text[ section.text.length - 1 ] ) )
					{
						section.end_modifiers = section.text[ section.text.length - 1 ];
						section.text = section.text.substring( 0, section.text.length - 1 );
					}
					sections.push( section );
					ich = ich1 + Step.ejs_end.length;
				}
				else { throw new Error( `Unreachable code was reached!` ); } // unreachable code
			}

			// Perform trim operations.
			for ( let section_index = 0; section_index < sections.length; section_index++ )
			{
				let section = sections[ section_index ];
				if ( section.type === 'code' )
				{
					section.text = section.text.trim();
					if ( section.start_modifiers.includes( '_' ) )
					{
						if ( section_index > 0 )
						{
							let other_section = sections[ section_index - 1 ];
							if ( other_section.type === 'text' )
							{
								let text = other_section.text;
								text = text.trimEnd();
								other_section.text = text;
							}
						}
					}
					if ( section.end_modifiers.includes( '_' ) )
					{
						if ( section_index < ( sections.length - 1 ) )
						{
							let other_section = sections[ section_index + 1 ];
							if ( other_section.type === 'text' )
							{
								let text = other_section.text;
								text = text.trimStart();
								other_section.text = text;
							}
						}
					}
					if ( section.end_modifiers.includes( '-' ) )
					{
						if ( section_index < ( sections.length - 1 ) )
						{
							let other_section = sections[ section_index + 1 ];
							if ( other_section.type === 'text' )
							{
								let text = other_section.text;
								while ( text.startsWith( '\r' ) || text.startsWith( '\n' ) )
								{
									text = text.substring( 1 );
								}
								other_section.text = text;
							}
						}
					}
				}
			}

			// Generate the document script.
			let script = '';
			for ( let section_index = 0; section_index < sections.length; section_index++ )
			{
				let section = sections[ section_index ];
				script += `/* Section ${section_index + 1}\n`;
				script += JSON.stringify( section, null, '    ' );
				script += `*/\n`;
				if ( section.type === 'text' )
				{
					script += `Output.print( ${JSON.stringify( section.text )} );\n`;
				}
				else if ( section.type === 'code' )
				{
					if ( section.start_modifiers.includes( '#' ) ) { continue; }
					if ( section.start_modifiers.includes( '-' ) ) 
					{
						script += `Output.print( ${section.text} );\n`;
						continue;
					}
					if ( section.start_modifiers.includes( '=' ) ) 
					{
						// script += `Output.print( escape( ${section.text} ) );\n`;
						script += `Output.print( encodeURI( ${section.text} ) );\n`;
						// script += `Output.print( encodeURIComponent( ${section.text} ) );\n`;
						continue;
					}
					script += section.text + '\n';
				}
			}
			if ( Step.script_file )
			{
				Step.script_file = Engine.ResolvePath( Context, Step.script_file );
				LIB_FS.writeFileSync( Step.script_file, `// Generated by devops on ${( new Date() ).toLocaleString()}\n` );
				LIB_FS.appendFileSync( Step.script_file, script );
			}

			// Prepare the output facility.
			let Output = {
				text: '',
				print: function ( Text )
				{
					Text = Text || '';
					this.text += Text;
				},
				printline: function ( Text )
				{
					Text = Text || '';
					this.text += Text + '\n';
				},
			};

			// Execute the document script.
			let result = null;
			if ( Step.use_eval )
			{
				result = eval( `"use strict"; ${script}; Output.text;` );
			}
			else
			{
				let filename = `${Engine.Loose.UUID()}.js`;
				filename = Engine.ResolvePath( Context, filename );
				LIB_FS.writeFileSync( filename, `"use strict";\nmodule.exports = function( Context, Output ){\n${script};\nreturn Output.text;\n};` );
				try
				{
					result = require( filename )( Context, Output );
				}
				catch ( error )
				{
					throw error;
				}
				finally
				{
					LIB_FS.unlinkSync( filename );
				}
			}

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
