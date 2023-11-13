'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$PrintContext',
		CommandHelp: `$PrintContext:
Prints a context variable value to the console.
Fields:
- context: The context variable to print.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field is required.` ); }
			if ( typeof Step.context !== 'string' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must be a string.` ); }
			let value = Engine.Loose.GetObjectValue( Context, Step.context );
			console.log( JSON.stringify( value, null, '    ' ) );
			return true;
		},


	};

	// Return the command.
	return Command;
};
