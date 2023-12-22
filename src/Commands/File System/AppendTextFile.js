'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'File System',
			CommandName: '$AppendTextFile',
			CommandHelp: [
				`Appends text to a file. The file is created if it does not exist.`
			],
			CommandFields: [
				{ name: 'filename', type: 's', description: `The name of the file to write to.` },
				{ name: 'value', type: 's', description: `The text value to write to the file.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `The "filename" field is required.` ); }
			if ( typeof Step.value === 'undefined' ) { throw new Error( `The "value" field is required.` ); }
			// Get the value.
			let value = Step.value;
			if ( typeof value === 'string' )
			{
				value = Engine.ResolveString( Context, value );
			}
			let filename = Engine.ResolvePath( Context, Step.filename );
			LIB_FS.appendFileSync( filename, value, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};
