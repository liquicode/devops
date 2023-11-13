'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ReadJsonFile',
		CommandHelp: `$ReadJsonFile:
Reads the contents of a json file or field into a context variable.
Fields:
- filename: The json file to read.
- context: The context variable to store the json in.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `The "filename" field is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `The "context" field is required.` ); }
			let filename = Engine.ResolvePath( Context, Step.filename );
			let data = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
			if ( typeof Step.field !== 'undefined' )
			{
				data = Engine.Loose.GetObjectValue( data, Step.field );
			}
			let result = Engine.Loose.SetObjectValue( Context, Step.context, data );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
