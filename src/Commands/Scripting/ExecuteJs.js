'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
// const jsongin = require( '@liquicode/jsongin' )();

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Scripting',
			CommandName: '$ExecuteJs',
			CommandHelp: `Executes Javascript code within a string or a file.`
				+ `The code is essentially require'ed (or eval'ed) into the task and has full access to all of the nodejs functions.`
				+ `This can be extremely unsafe but it also gives you much more flexibility.`
				+ `The Javascript code will have access to the Task Context (as 'Context') and be able to modify it.`
				+ `The @liquicode/jsongin library is preloaded and available as 'jsongin' within the code.`,
			CommandFields: [
				{ name: 'code_file', type: 's', default: '', description: 'The path to a Javascript file to load and execute.' },
				{ name: 'code_string', type: 's', default: '', description: 'A string of Javascript code to execute. Either this or code_file should be used.' },
				{ name: 'use_eval', type: 'b', default: true, description: 'Forces the processor to use "eval()" (instead of "require()") for code execution.' },
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
			if ( !Step.code_file && !Step.code_string ) { throw new Error( `One of "code_file" or "code_string" should be defined.` ); }
			if ( Step.code_file && Step.code_string ) { throw new Error( `Only one of "code_file" and "code_string" should be defined.` ); }
			if ( typeof Step.use_eval === 'undefined' ) { Step.use_eval = false; }
			if ( typeof Step.out_context === 'undefined' ) { Step.out_context = ''; }

			// Get the code string.
			let code_string = null;
			if ( Step.code_file )
			{
				let path = Engine.ResolvePath( Context, Step.code_file );
				if ( !LIB_FS.existsSync( path ) ) { throw new Error( `The code file [${path}] does not exist.` ); }
				code_string = LIB_FS.readFileSync( path, 'utf8' );
			}
			else
			{
				code_string = Engine.ResolveString( Context, Step.code_string );
			}

			// Execute the code string.
			let result = null;
			if ( Step.use_eval )
			{
				result = eval( `var jsongin = require( '@liquicode/jsongin' )(); ${script};` );
			}
			else
			{
				let filename = `${Engine.Loose.UUID()}.js`;
				filename = Engine.ResolvePath( Context, filename );
				LIB_FS.writeFileSync( filename, `var jsongin = require( '@liquicode/jsongin' )(); module.exports = function( Context ){ ${script}; };` );
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

			// Store the result in the Context.
			Engine.SendOutput( Context, Step.out, result );

			// Return true
			return true;
		},


	};

	// Return the command.
	return Command;
};
