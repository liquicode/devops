'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$EnsureFolder',
		CommandHelp: `$EnsureFolder:
Makes sure that the specified folder exists. Creates the folder if needed.
Fields:
- folder: The folder to ensure.
`,


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
