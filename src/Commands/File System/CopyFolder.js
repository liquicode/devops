'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$CopyFolder',
		CommandHelp: `$CopyFolder:
Copies a folder and its contents from one path to another.
Fields:
- from: The folder to copy from.
- to: The destination path of the copied folder.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.from === 'undefined' ) { throw new Error( `${Command.CommandName}: The "from" field is required.` ); }
			if ( typeof Step.to === 'undefined' ) { throw new Error( `${Command.CommandName}: The "to" field is required.` ); }
			let from_path = Engine.ResolvePath( Context, Step.from );
			let to_path = Engine.ResolvePath( Context, Step.to );
			if ( from_path.startsWith( to_path ) ) { throw new Error( `${Command.CommandName}: The "to" path cannot be a descendant of the "from" path.` ); }
			copy_folder_recursive( from_path, to_path );
			return true;
		},

	};

	// Return the command.
	return Command;
};


//---------------------------------------------------------------------
function copy_folder_recursive( src, dest )
{
	let exists = LIB_FS.existsSync( src );
	let stats = exists && LIB_FS.statSync( src );
	let is_folder = exists && stats.isDirectory();
	if ( is_folder )
	{
		LIB_FS.mkdirSync( dest );
		LIB_FS.readdirSync( src ).forEach( function ( child_name )
		{
			copy_folder_recursive(
				LIB_PATH.join( src, child_name ),
				LIB_PATH.join( dest, child_name ) );
		} );
	}
	else
	{
		LIB_FS.copyFileSync( src, dest );
	}
};

