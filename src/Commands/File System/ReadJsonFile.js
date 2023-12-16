'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'File System',
			CommandName: '$ReadJsonFile',
			CommandHelp: `Reads the contents of a json file or field.`,
			CommandFields: [
				{ name: 'filename', type: 's', description: `The json file to read.` },
				{ name: 'field', type: 's', default: '', description: `The name of the field to read. Leave empty to read the entire json object.` },
				{ name: 'out.as', type: 's', default: '', description: `Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion.` },
				{ name: 'out.console', type: 'b', default: false, description: `Send output to the console (i.e. console.log).` },
				{ name: 'out.log', type: 'b', default: false, description: `Send output to the devop's log.` },
				{ name: 'out.filename', type: 's', default: '', description: `Send output to a file.` },
				{ name: 'out.context', type: 's', default: '', description: `The name of a Context field to send the output to.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `The "filename" field is required.` ); }
			let filename = Engine.ResolvePath( Context, Step.filename );
			let value = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
			if ( Step.field )
			{
				value = Engine.jsongin.GetValue( value, Step.field );
			}
			Engine.SendOutput( Context, Step.out, value );
			return true;
		},


	};

	// Return the command.
	return Command;
};
