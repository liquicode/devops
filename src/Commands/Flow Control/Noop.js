'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Flow Control',
			CommandName: '$Noop',
			CommandHelp: `Performs no operation and is ignored.`,
			CommandFields: [],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			return true;
		},
	};

	// Return the command.
	return Command;
};
