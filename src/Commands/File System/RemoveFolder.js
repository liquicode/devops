'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'File System',
			CommandName: '$RemoveFolder',
			CommandHelp: `Removes a folder.`,
			CommandFields: [
				{ name: 'folder', type: 's', description: `The folder to remove.` },
				{ name: 'force', type: 'b', default: false, description: `If true, removes the folder even if it is not empty.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.folder === 'undefined' ) { throw new Error( `The "folder" field is required.` ); }
			let path = Engine.ResolvePath( Context, Step.folder );
			if ( LIB_FS.existsSync( path ) === false ) { return true; }
			if ( Step.force )
			{
				//NOTE; do we need to call rmSync here?
				// LIB_FS.rmdirSync( path, { recursive: true, force: true } );
				// FS_rmdirSync( path, { recursive: true, force: true } );
				if ( process.version >= 'v14.14.0' )
				{
					LIB_FS.rmSync( path, { recursive: true, force: true } );
				}
				else
				{
					LIB_FS.rmdirSync( path, { recursive: true, force: true } );
				}
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
