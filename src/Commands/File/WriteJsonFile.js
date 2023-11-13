'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$WriteJsonFile',
		CommandHelp: `$WriteJsonFile:
Writes or updates a json file with values from a context variable.
Fields:
- filename: The json file to write.
- context: The context variable value to write.
- friendly: If true, the json is written back to the file in expanded form with newlines and spaces.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `${Command.CommandName}: The "filename" field is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `${Command.CommandName}: The "context" field is required.` ); }

			// Get the value.
			let value = Engine.Loose.GetObjectValue( Context, Step.context );

			// Format the JSON.
			let json = null;
			if ( Step.friendly )
			{
				json = JSON.stringify( value, null, '\t' );
			}
			else
			{
				json = JSON.stringify( value );
			}

			// Write the JSON.
			let filename = Engine.ResolvePath( Context, Step.filename );
			LIB_FS.writeFileSync( filename, json, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};
