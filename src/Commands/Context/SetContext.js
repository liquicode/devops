'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Context',
			CommandName: '$SetContext',
			CommandHelp: `Sets a field in the context.`,
			CommandFields: [
				{ name: 'context', type: 's', description: 'The name of the Context field to store the value to.' },
				{ name: 'value', type: '', description: 'The value to set.' },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			let result = Engine.jsongin.SetValue( Context, Step.context, Step.value );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
