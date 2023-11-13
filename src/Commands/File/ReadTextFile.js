'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ReadTextFile',
		CommandHelp: `$ReadTextFile:
Reads the contents of a text file into a context variable.
Fields:
- filename: The file to read.
- context: The context variable to store the content in.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `The "filename" field is required.` ); }
			if ( typeof Step.context === 'undefined' ) { throw new Error( `The "context" field is required.` ); }
			let filename = Engine.ResolvePath( Context, Step.filename );
			let data = LIB_FS.readFileSync( filename, 'utf8' );
			let result = Engine.Loose.SetObjectValue( Context, Step.context, data );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
