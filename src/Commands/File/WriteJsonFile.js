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
- context: The context variable store value to write.
- friendly: If true, the json is written back to the file in expanded form with newlines and spaces.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `$WriteJsonFile: The "filename" field is required.` ); }
			if ( typeof Step.value === 'undefined' ) { throw new Error( `$WriteJsonFile: The "value" field is required.` ); }

			// Get the value.
			let value = Step.value;
			if ( typeof value === 'string' )
			{
				value = Engine.ResolveString( Context, value );
			}

			// Read the JSON.
			let filename = Engine.ResolvePath( Context, Step.filename );
			let data = null;
			if ( typeof Step.field !== 'undefined' )
			{
				data = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
				// data[ Step.field ] = value;
				let result = Engine.Loose.SetObjectValue( data, Step.field, value );
				if ( result === false ) { return false; }
			}
			else
			{
				data = value;
			}

			// Write the JSON.
			let json = null;
			if ( Step.friendly )
			{
				json = JSON.stringify( data, null, '\t' );
			}
			else
			{
				json = JSON.stringify( data );
			}
			LIB_FS.writeFileSync( filename, json, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};
