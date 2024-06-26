'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Flow Control',
			CommandName: '$RunSteps',
			CommandHelp: `Runs a set of steps defined within this step.`,
			CommandFields: [
				{ name: 'steps', type: 'a', description: 'An array of steps to run.' },
			],
			Examples: [
				{
					$RunSteps: {
						_: 'Run a number of sub steps.',
						steps: [
							{ $Shell: { command: 'node --version', out: { console: true } } },
							{ $Shell: { command: 'node my-file.js', out: { console: true } } },
						]
					}
				},
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			let success = await Engine.RunSteps( '(RunSteps)', Step.steps, Context );
			if ( success === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
