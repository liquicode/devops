'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$PrependTextFile',
		CommandHelp: `$PrependTextFile:
Inserts text into the beginning of a file. The file is created if it does not exist.
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
			let content = '';
			if ( LIB_FS, LIB_FS.existsSync( filename ) )
			{
				content = LIB_FS.readFileSync( filename, 'utf8' );
			}
			content = value + content;
			LIB_FS.WriteFileSync( filename, content, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};
