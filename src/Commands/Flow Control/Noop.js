'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$Noop',
		CommandHelp: `$Noop:
Performs no operation and is ignored.
Fields:
This command takes no fields. Any that are supplied are ignored.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			return true;
		},
	};

	// Return the command.
	return Command;
};
