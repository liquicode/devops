'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'File System',
			CommandName: '$EnsureFolder',
			CommandHelp: `Makes sure that the specified folder exists. Creates the folder and any intermediate folders if needed.`,
			CommandFields: [
				{ name: 'folder', type: 's', description: `The folder to ensure/create.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.folder === 'undefined' ) { throw new Error( `The "folder" field is required.` ); }
			let path = Engine.ResolvePath( Context, Step.folder );
			if ( LIB_FS.existsSync( path ) === false )
			{
				LIB_FS.mkdirSync( path, { recursive: true } );
			}
			return true;
		},


	};

	// Return the command.
	return Command;
};
