'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$LoadJsModule',
		CommandHelp: `$LoadJsModule:
Loads (requires) a Javascript module (.js) file into a context variable.
Fields:
- filename: The Javascript module file to read.
- context: The context variable to store the Javascript module in.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `${Command.CommandName}: The "filename" field is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: The "context" field is required.` ); }
			let filename = Engine.ResolvePath( Context, Step.filename );
			let value = require( filename );
			let result = Engine.Loose.SetObjectValue( Context, Step.context, value );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
