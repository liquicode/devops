'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$PrintContext',
		CommandHelp: `$PrintContext:
Prints a context variable value to the console.
Fields:
- context: (optional) The context variable to print. Leave empty to print entire context.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }

			let value = Context;
			if ( typeof Step.context === 'string' ) 
			{
				value = Engine.Loose.GetObjectValue( Context, Step.context );
			}
			console.log( JSON.stringify( value, null, '    ' ) );

			return true;
		},


	};

	// Return the command.
	return Command;
};
