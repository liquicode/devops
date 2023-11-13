'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$WriteTextFile',
		CommandHelp: `$WriteTextFile:
Writes a text to a file.
Fields:
- filename: The file to write.
- value: The text to write. Can be a context variable.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `The "filename" field is required.` ); }
			if ( typeof Step.value === 'undefined' ) { throw new Error( `The "value" field is required.` ); }
			// Get the value.
			let value = Step.value;
			if ( typeof value === 'string' )
			{
				value = Engine.ResolveString( Context, value );
			}
			let filename = Engine.ResolvePath( Context, Step.filename );
			LIB_FS.writeFileSync( filename, value, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};
