'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$CopyFile',
		CommandHelp: `$CopyFile:
Copies a file from one folder to another.
Fields:
- from: The file to copy.
- to: The destination filename of the file to copy.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.from === 'undefined' ) { throw new Error( `${Command.CommandName}: $CopyFile: The "from" field is required.` ); }
			if ( typeof Step.to === 'undefined' ) { throw new Error( `${Command.CommandName}: $CopyFile: The "to" field is required.` ); }
			let from_path = Engine.ResolvePath( Context, Step.from );
			let to_path = Engine.ResolvePath( Context, Step.to );
			LIB_FS.copyFileSync( from_path, to_path );
			return true;
		},


	};

	// Return the command.
	return Command;
};
