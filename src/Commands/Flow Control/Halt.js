'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$Halt',
		CommandHelp: `$Halt:
Halts execution of the current task.
Fields:
This command takes no fields. Any that are supplied are ignored.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			return false;
		},
	};

	// Return the command.
	return Command;
};
