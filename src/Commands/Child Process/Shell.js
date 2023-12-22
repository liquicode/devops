'use strict';

const LIB_FS = require( 'fs' );
const LIB_CHILD_PROCESS = require( 'child_process' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Child Process',
			CommandName: '$Shell',
			CommandHelp: [
				`Execute a command line.`,
				`Can redirect process output and errors.`
			],
			CommandFields: [
				{ name: 'command', type: 's', description: `The command line to execute.` },
				{ name: 'halt_on_error', type: 'b', default: true, description: `Set to false to ignore errors and continue processing this task. Defaults to true.` },
				{ name: 'out.as', type: 's', default: '', description: `Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion.` },
				{ name: 'out.console', type: 'b', default: false, description: `Send output to the console (i.e. console.log).` },
				{ name: 'out.log', type: 'b', default: false, description: `Send output to the devop's log.` },
				{ name: 'out.filename', type: 's', default: '', description: `Send output to a file.` },
				{ name: 'out.context', type: 's', default: '', description: `The name of a Context field to send the output to.` },
				{ name: 'err.console', type: 'b', default: false, description: `Send errors to the console (i.e. console.error).` },
				{ name: 'err.log', type: 'b', default: false, description: `Send errors to the devop's error log.` },
				{ name: 'err.filename', type: 's', default: '', description: `Send errors to a file.` },
				{ name: 'err.context', type: 's', default: '', description: `The name of a Context field to send the errors to.` },
			],
			Examples: [
				{
					$Shell: {
						_: 'Print the node version to the console.',
						command: 'node --version',
						out: { console: true }
					}
				},
				{
					$Shell: {
						_: 'Print the node version to the Context.',
						command: 'node --version',
						out: { context: 'node_version' }
					}
				},
				{
					$Shell: {
						_: 'Store output in Context and print errors to console.',
						command: 'dubious-process -args',
						out: { context: 'result' },
						err: { console: true },
					}
				},
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			// if ( typeof Step.command === 'undefined' ) { throw new Error( `The "command" field is required.` ); }
			// if ( typeof Step.command !== 'string' ) { throw new Error( `The "command" field must be a string.` ); }

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
			Engine.SendOutput( Context, Step.out, result.stdout );
			Engine.SendErrors( Context, Step.err, result.stderr );
			if ( Step.halt_on_error && result.stderr ) { return false; }

			// Return, OK.
			return true;
		},


	};

	// Return the command.
	return Command;
};
