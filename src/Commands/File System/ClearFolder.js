'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ClearFolder',
		CommandHelp: `$ClearFolder:
Removes all files from the specified folder.
Fields:
- folder: The folder to remove files from.
- recurse: If true, removes all files in sub-folders as well.
- remove_folders: If true, removes all sub-folders as well.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			function r_ClearFolder( Context, Path )
			{
				if ( LIB_FS.existsSync( Path ) === false ) { return true; }
				let entries = LIB_FS.readdirSync( Path, { withFileTypes: true, recursive: false } );
				for ( let index = 0; index < entries.length; index++ )
				{
					let filename = LIB_PATH.join( Path, entries[ index ].name );
					if ( entries[ index ].isDirectory() === true )
					{
						let result = r_ClearFolder( Context, filename );
						if ( result === false ) { return false; }
						LIB_FS.rmdirSync( filename );
					}
					else
					{
						LIB_FS.unlinkSync( filename );
					}
				}
				return true;
			}
			if ( typeof Step.folder === 'undefined' ) { throw new Error( `${Command.CommandName}: The "folder" field is required.` ); }
			let path = Engine.ResolvePath( Context, Step.folder );
			let result = r_ClearFolder( Context, path );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
