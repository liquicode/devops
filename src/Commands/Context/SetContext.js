'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$SetContext',
		CommandHelp: `$SetContext:
Sets a context variable to a value
Fields:
- context: The context variable to modify. This variable will be created if it does not exist.
- value: The value to set.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field is required.` ); }
			if ( typeof Step.context !== 'string' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must be a string.` ); }
			let result = Engine.Loose.SetObjectValue( Context, Step.context, Step.value );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
