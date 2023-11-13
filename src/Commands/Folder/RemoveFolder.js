'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$RemoveFolder',
		CommandHelp: `$RemoveFolder:
Removes the specified folder.
Fields:
- folder: The folder to remove.
- force: If true, removes the folder even if it is not empoty.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.folder === 'undefined' ) { throw new Error( `${Command.CommandName}: The "folder" field is required.` ); }
			let path = Engine.ResolvePath( Context, Step.folder );
			if ( LIB_FS.existsSync( path ) === false ) { return true; }
			if ( Step.force )
			{
				//NOTE; do we need to call rmSync here?
				LIB_FS.rmdirSync( path, { recursive: true, force: true } );
			}
			else
			{
				LIB_FS.rmdirSync( path );
			}
			return true;
		},


	};

	// Return the command.
	return Command;
};
