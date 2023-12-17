'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
// const jsongin = require( '@liquicode/jsongin' );
const _parse_ejs_sections = require( './_parse_ejs_sections' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Scripting',
			CommandName: '$ExecuteEjs',
			CommandHelp: `Processes a document file or string containing Embedded Javascript (ejs) code.`
				+ `This command works in the same way as official ejs does (see: https://github.com/mde/ejs).`
				+ `The return value of this command is a text string containing the processed document after all embedded js code has been executed.`
				+ `This returned string can be written to a file and/or stored in a Context variable.`
				+ `This is a text based process and should work on any text based document (e.g. html, md, xml, json, etc.).`
				+ ``
				+ `Embedded code has access to the Task's 'Context' object and is able to modify it.`
				+ `Code also has access to an 'Output' object which lets it print text directly to the final document.`
				+ ``
				+ `Supports the following ejs tags (from official ejs docs (https://ejs.co/#docs)):`
				+ `- <%  :'Scriptlet' tag, for control-flow, no output`
				+ `- <%_ : 'Whitespace Slurping' Scriptlet tag, strips all whitespace before it`
				+ `- <%= : Outputs the value into the template (HTML escaped)`
				+ `- <%- : Outputs the unescaped value into the template`
				+ `- <%# : Comment tag, no execution, no output`
				+ `- <%% : Outputs a literal '<%'`
				+ `-  %> : Plain ending tag`
				+ `- -%> : Trim-mode ('newline slurp') tag, trims following newline`
				+ `- _%> : 'Whitespace Slurping' ending tag, removes all whitespace after it`
				+ ``
				+ `Shortcut for a single line of code:`
				+ `'<%*' treats entire rest of the line as code.`
				+ `No closing tag should be provided.`
				+ `Can be combined with other start tag modifiers (e.g. <%*- or <%-* ).`
				+ `A side effect of using '*' is that no newline will be printed after it,`
				+ `making it very useful when used alone '<%*' but confusing when used with other modifiers.`
				+ `If you see an error like '$ExecuteEjs threw an error: missing ) after argument list',`
				+ `check to make sure you haven't also included a closing tag after using '*'.`
				+ ``
				+ `Include other ejs files:`
				+ `Use the 'include' statement to include other ejs files.`
				+ `Must appear by itself within a code section and contain the path of the file to include.`
				+ `ex: '<% include( docs/_partials/heading.ejs ) %>' Note the absence of quotes surrounding the filename.`
				+ `Like all other filenames, it must be represented relative to the package folder.`
				+ ``
				+ `Differences from official ejs:`
				+ `- Can execute embedded code using "require()" or "eval()". Official ejs uses only "eval()".`
				+ `- The '*' tag modifier is not part of offical ejs.`
				+ `- The 'include' statement requires a path relative to the package folder. With official ejs you can specify a full path or a path relative to the including file.`
				+ `- The @liquicode/jsongin library is preloaded and available as 'jsongin' within the code.`,
			CommandFields: [
				{ name: 'ejs_file', type: 's', default: '', description: 'The path to an Embedded Javascript file to load and execute.' },
				{ name: 'ejs_string', type: 's', default: '', description: 'A string of Embedded Javascript code to execute. Either this or code_file should be used.' },
				{ name: 'ejs_start', type: 's', default: '<%', description: 'Token to delineate the beginning of an embedded js section. Defaults to "<%", set to empty to disable embedded js.' },
				{ name: 'ejs_end', type: 's', default: '%>', description: 'Token to delineate the end of an embedded js section. Defaults to "%>".' },
				{ name: 'use_eval', type: 'b', default: true, description: 'Forces the processor to use "eval()" (instead of "require()") for code execution.' },
				{ name: 'debug_script.as', type: 's', default: '', description: `Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion.` },
				{ name: 'debug_script.console', type: 'b', default: false, description: `Send output to the console (i.e. console.log).` },
				{ name: 'debug_script.log', type: 'b', default: false, description: `Send output to the devop's log.` },
				{ name: 'debug_script.filename', type: 's', default: '', description: `Send output to a file.` },
				{ name: 'debug_script.context', type: 's', default: '', description: `The name of a Context field to send the output to.` },
				{ name: 'out.as', type: 's', default: '', description: `Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion.` },
				{ name: 'out.console', type: 'b', default: false, description: `Send output to the console (i.e. console.log).` },
				{ name: 'out.log', type: 'b', default: false, description: `Send output to the devop's log.` },
				{ name: 'out.filename', type: 's', default: '', description: `Send output to a file.` },
				{ name: 'out.context', type: 's', default: '', description: `The name of a Context field to send the output to.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.ejs_start === 'undefined' ) { Step.ejs_start = '<%'; }
			if ( typeof Step.ejs_end === 'undefined' ) { Step.ejs_end = '%>'; }
			if ( !Step.ejs_file && !Step.ejs_string ) { throw new Error( `One of "ejs_file" or "ejs_string" should be defined.` ); }
			if ( Step.ejs_file && Step.ejs_string ) { throw new Error( `Only one of "ejs_file" and "ejs_string" should be defined.` ); }
			if ( typeof Step.use_eval === 'undefined' ) { Step.use_eval = false; }
			if ( typeof Step.out_file === 'undefined' ) { Step.out_file = ''; }
			if ( typeof Step.out_context === 'undefined' ) { Step.out_context = ''; }

			// Get the code string.
			let ejs_filename = '';
			let ejs_string = null;
			if ( Step.ejs_file )
			{
				ejs_filename = Engine.ResolvePath( Context, Step.ejs_file );
				if ( !LIB_FS.existsSync( ejs_filename ) ) { throw new Error( `The code file [${path}] does not exist.` ); }
				ejs_string = LIB_FS.readFileSync( ejs_filename, 'utf8' );
			}
			else
			{
				ejs_string = Engine.ResolveString( Context, Step.ejs_string );
			}

			// Parse the document into text and code sections.
			let sections = _parse_ejs_sections( Engine, Context, ejs_filename, ejs_string, Step.ejs_start, Step.ejs_end );

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

			if ( Step.debug_script )
			{
				Engine.SendOutput( Context, Step.debug_script, script );
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
				let eval_script = `let jsongin = require( '@liquicode/jsongin' );\n`;
				eval_script += `${script};\n`;
				eval_script += `Output.text;\n`;
				result = eval( eval_script );
			}
			else
			{
				let eval_script = `let jsongin = require( '@liquicode/jsongin' );\n`;
				eval_script += `module.exports = function( Context, Output ){\n`;
				eval_script += `${script};\n`;
				eval_script += `return Output.text;\n`;
				eval_script += `};\n`;

				let filename = `${Engine.Loose.UUID()}.js`;
				filename = Engine.ResolvePath( Context, filename );

				LIB_FS.writeFileSync( filename, eval_script );
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
			Engine.SendOutput( Context, Step.out, result );

			// Return true
			return true;
		},


	};

	// Return the command.
	return Command;
};
