'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Flow Control',
			CommandName: '$Halt',
			CommandHelp: `Halts execution of the current task.`,
			CommandFields: [],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			return false;
		},
	};

	// Return the command.
	return Command;
};
