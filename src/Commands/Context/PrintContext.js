'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Context',
			CommandName: '$PrintContext',
			CommandHelp: `Prints a context variable value to the output.`,
			CommandFields: [
				{ name: 'context', type: 's', default: '', description: 'The name of the Context field to send to the output. Leave empty to send the entire Context.' },
				{ name: 'out.as', type: 's', default: '', description: `Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion.` },
				{ name: 'out.console', type: 'b', default: false, description: `Send output to the console (i.e. console.log).` },
				{ name: 'out.log', type: 'b', default: false, description: `Send output to the devop's log.` },
				{ name: 'out.filename', type: 's', default: '', description: `Send output to a file.` },
				{ name: 'out.context', type: 's', default: '', description: `The name of a Context field to send the output to.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }

			let value = Context;
			if ( Step.context ) 
			{
				value = Engine.jsongin.GetValue( Context, Step.context );
			}
			// console.log( JSON.stringify( value, null, '    ' ) );
			Engine.SendOutput( Context, Step.out, value );

			return true;
		},


	};

	// Return the command.
	return Command;
};
