'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Flow Control',
			CommandName: '$If',
			CommandHelp: [ `Conditionally execute steps based on the state of the Context.` ],
			CommandFields: [
				{ name: 'criteria', type: 'o', description: 'A jsongin query criteria to match against the Context.' },
				{ name: 'then', type: 'a', default: [], description: 'Steps to run when the condition is true.' },
				{ name: 'else', type: 'a', default: [], description: 'Steps to run when the condition is false.' },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			let result = Engine.jsongin.Query( Context, Step.criteria );
			if ( result === true ) 
			{
				let success = await Engine.RunSteps( '(Then-RunSteps)', Step.then, Context );
				if ( success === false ) { return false; }
			}
			else
			{
				let success = await Engine.RunSteps( '(Then-RunSteps)', Step.else, Context );
				if ( success === false ) { return false; }
			}
			return true;
		},


	};

	// Return the command.
	return Command;
};
