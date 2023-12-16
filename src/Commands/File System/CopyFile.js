'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'File System',
			CommandName: '$CopyFile',
			CommandHelp: `Copies a file from one folder to another. If the destination path does not exist, it will be created`,
			CommandFields: [
				{ name: 'from', type: 's', description: `The file to copy.` },
				{ name: 'to', type: 's', description: `The destination filename of the file to copy.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			let from_path = Engine.ResolvePath( Context, Step.from );
			let to_path = Engine.ResolvePath( Context, Step.to );
			{
				let path = LIB_PATH.dirname( to_path );
				if ( !LIB_FS.existsSync( path ) )
				{
					LIB_FS.mkdirSync( path, { recursive: true } );
				}
			}
			LIB_FS.copyFileSync( from_path, to_path );
			return true;
		},


	};

	// Return the command.
	return Command;
};
