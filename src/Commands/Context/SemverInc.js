'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$SemverInc',
		CommandHelp: `$SemverInc:
Increments a semver formatted version number stored in the context.
Fields:
- context: The context variable containing the version number.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field is required.` ); }
			if ( typeof Step.context !== 'string' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must be a string.` ); }

			// Resolve the context variable.
			let value = Engine.Loose.GetObjectValue( Context, Step.context );
			if ( typeof value !== 'string' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must point to semver formatted version number.` ); }

			// Parse the version number.
			let parts = value.split( '.' );
			if ( parts.length === 0 ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must point to semver formatted version number.` ); }
			let n = Number( parts[ parts.length - 1 ] );
			if ( isNaN( n ) ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "context" field must point to semver formatted version number.` ); }

			// Increment the version number.
			n++;
			parts[ parts.length - 1 ] = `${n}`;
			value = parts.join( '.' );

			// Store the version number.
			let result = Engine.Loose.SetObjectValue( Context, Step.context, value );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
