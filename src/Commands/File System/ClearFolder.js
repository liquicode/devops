'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'File System',
			CommandName: '$ClearFolder',
			CommandHelp: `Removes all files from a folder.`,
			CommandFields: [
				{ name: 'folder', type: 's', description: `The folder to remove files from.` },
				{ name: 'recurse', type: 'b', default: false, description: `If true, removes all sub-folders and files as well.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
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
			if ( typeof Step.folder === 'undefined' ) { throw new Error( `The "folder" field is required.` ); }
			let path = Engine.ResolvePath( Context, Step.folder );
			let result = r_ClearFolder( Context, path );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
