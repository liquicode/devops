'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$AppendTextFile',
		CommandHelp: `$AppendTextFile:
Appends text to a file. The file is created if it does not exist.
Fields:
- filename: The file to write.
- value: The text to write. Can be a context variable.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "filename" field is required.` ); }
			if ( typeof Step.value === 'undefined' ) { throw new Error( `${Command.CommandName}: ${Command.CommandName}: The "value" field is required.` ); }
			// Get the value.
			let value = Step.value;
			if ( typeof value === 'string' )
			{
				value = Engine.ResolveString( Context, value );
			}
			let filename = Engine.ResolvePath( Context, Step.filename );
			LIB_FS.appendFileSync( filename, value, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};