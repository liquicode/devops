'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
// const jsongin = require( '@liquicode/jsongin' )();

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ExecuteJs',
		CommandHelp: `$ExecuteJs:
Executes Javascript code within a string or a file.
The code is essentially require'ed (or eval'ed) into the task and has full access to all of the nodejs functions.
This can be extremely unsafe but it also gives you much more flexibility.
The Javascript code will have access to the Task Context (as 'Context') and be able to modify it.

Fields:
- code_file: The path to a Javascript file to load and execute.
- code_string: A string of Javascript code to execute. Either this or code_file should be used.
- use_eval: Forces the processor to revert back to using "eval()" for code execution.
- out_context: Context variable to store the result of the execution.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( !Step.code_file && !Step.code_string ) { throw new Error( `${Command.CommandName}: One of "code_file" or "code_string" should be defined.` ); }
			if ( Step.code_file && Step.code_string ) { throw new Error( `${Command.CommandName}: Only one of "code_file" and "code_string" should be defined.` ); }
			if ( typeof Step.use_eval === 'undefined' ) { Step.use_eval = false; }
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

			// Execute the code string.
			let result = null;
			if ( Step.use_eval )
			{
				result = eval( script );
			}
			else
			{
				let filename = `${Engine.Loose.UUID()}.js`;
				filename = Engine.ResolvePath( Context, filename );
				LIB_FS.writeFileSync( filename, `module.exports = function( Context ){ ${script} };` );
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
			if ( Step.out_context && ( typeof result !== 'undefined' ) )
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
