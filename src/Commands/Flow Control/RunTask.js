'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Flow Control',
			CommandName: '$RunTask',
			CommandHelp: `Runs another task found in the same devops task file.`,
			CommandFields: [
				{ name: 'task', type: 's', description: 'The name of the task to run.' },
			],
			Examples: [
				{
					$RunTask: {
						_: 'Run another task in the same file.',
						task: 'build_docs'
					}
				},
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			let name = Engine.ResolveString( Context, Step.task );
			let result = await Engine.RunTask( name, Context );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
