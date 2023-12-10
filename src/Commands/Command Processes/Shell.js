'use strict';

const LIB_FS = require( 'fs' );
const LIB_CHILD_PROCESS = require( 'child_process' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$Shell',
		CommandHelp: `$Shell:
Execute a command line. Can redirect process output and/or errors.
Fields:
- command: The command line to execute.
- output: Redirects process output to one of
	- 'console'
	- a filename
	- a context variable
- errors: Redirects process errors to one of
	- 'console'
	- a filename
	- a context variable
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step.command === 'undefined' ) { throw new Error( `${Command.CommandName}: $Shell: The "command" field is required.` ); }
			if ( typeof Step.command !== 'string' ) { throw new Error( `${Command.CommandName}: $Shell: The "command" field must be a string.` ); }

			let command = Engine.ResolveString( Context, Step.command );
			let result = null;

			try
			{
				// Execute the process.
				result = await new Promise(
					( resolve, reject ) =>
					{
						LIB_CHILD_PROCESS.exec( command,
							( error, stdout, stderr ) =>
							{
								if ( error )
								{
									reject( error );
									return;
								}
								let output = {
									stdout: stdout,
									stderr: stderr,
								};
								resolve( output );
							} );
						return;
					} );
			}
			catch ( error )
			{
				result = {
					stdout: null,
					stderr: error.message,
				};
			}

			// Redirect output.
			if ( Step.output && result.stdout )
			{
				if ( Step.output === 'console' )
				{
					Engine.Log.Print( result.stdout );
				}
				else if ( Step.output.startsWith( Engine.Settings.VariableDelimiters[ 0 ] )
					&& Step.output.endsWith( Engine.Settings.VariableDelimiters[ 1 ] ) )
				{
					let ich0 = Engine.Settings.VariableDelimiters[ 0 ].length;
					let ich1 = Step.output.length - ( Engine.Settings.VariableDelimiters[ 0 ].length + Engine.Settings.VariableDelimiters[ 1 ].length );
					let name = Step.output.substring( ich0, ich1 );
					Engine.Loose.SetObjectValue( Context, name, result.stdout );
				}
				else
				{
					let filename = Engine.ResolvePath( Context, Step.output );
					LIB_FS.writeFileSync( filename, result.stdout, 'utf8' );
				}
			}

			// Redirect errors.
			if ( Step.errors && result.stderr )
			{
				if ( Step.errors === 'console' )
				{
					Engine.Log.Error( result.stderr );
				}
				else if ( Step.output.startsWith( Engine.Settings.VariableDelimiters[ 0 ] )
					&& Step.output.endsWith( Engine.Settings.VariableDelimiters[ 1 ] ) )
				{
					let ich0 = Engine.Settings.VariableDelimiters[ 0 ].length;
					let ich1 = Step.errors.length - ( Engine.Settings.VariableDelimiters[ 0 ].length + Engine.Settings.VariableDelimiters[ 1 ].length );
					let name = Step.errors.substring( ich0, ich1 );
					Engine.Loose.SetObjectValue( Context, name, result.stderr );
				}
				else
				{
					let filename = Engine.ResolvePath( Context, Step.errors );
					LIB_FS.writeFileSync( filename, result.stderr, 'utf8' );
				}
			}
			if ( Step.halt_on_error && result.stderr ) { return false; }

			// Return, OK.
			return true;
		},


	};

	// Return the command.
	return Command;
};
