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
			if ( typeof Step.command === 'undefined' ) { throw new Error( `$Shell: The "command" field is required.` ); }

			// Execute the process.
			let result = await new Promise(
				( resolve, reject ) =>
				{
					LIB_CHILD_PROCESS.exec( Step.command,
						( error, stdout, stderr ) =>
						{
							if ( error )
							{
								reject( error );
								return;
							}
							let output =
							{
								stdout: stdout,
								stderr: stderr,
							};
							resolve( output );
						} );
					return;
				} );

			// Redirect output.
			if ( typeof Step.output !== 'undefined' )
			{
				if ( Step.output === 'console' )
				{
					console.log( result.stdout );
				}
				else
				{
					let filename = resolve_path( Context, Step.output );
					LIB_FS.writeFileSync( filename, result.stdout, 'utf8' );
				}
			}

			// Redirect errors.
			if ( typeof Step.errors !== 'undefined' )
			{
				if ( Step.errors === 'console' )
				{
					console.log( result.stderr );
				}
				else
				{
					let filename = resolve_path( Context, Step.errors );
					LIB_FS.writeFileSync( filename, result.stderr, 'utf8' );
				}
			}

			// Return, OK.
			return true;
		},


	};

	// Return the command.
	return Command;
};
