'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$_blank',
		CommandHelp: `$_blank:
<command description>
Fields:
<field descriptions>
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
