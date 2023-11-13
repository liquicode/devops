'use strict';

const LIB_FS = require( 'fs' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$ReplaceFileText',
		CommandHelp: `$ReplaceFileText:
Replaces text within a file.
Fields:
- filename: The file to replace text in.
- value: The text to replace.
- start_text: (optional) The text bounding the left side of the replacement. If not supplied, the start of the file is used.
- end_text: (optional) The text bounding the right side of the replacement. If not supplied, the end of the file is used.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `${Command.CommandName}: The [Step] parameter is required.` ); }
			if ( typeof Step.filename === 'undefined' ) { throw new Error( `${Command.CommandName}: The "filename" field is required.` ); }
			if ( typeof Step.value === 'undefined' ) { throw new Error( `${Command.CommandName}: The "value" field is required.` ); }
			// Get the value.
			let value = Step.value;
			if ( typeof value === 'string' )
			{
				value = Engine.ResolveString( Context, value );
			}
			// Read the file.
			let filename = Engine.ResolvePath( Context, Step.filename );
			let text = LIB_FS.readFileSync( filename, 'utf8' );
			// Replace text.
			let items = Engine.Loose.FindAllBetween( text, Step.start_text, Step.end_text );
			for ( let index = 0; index < items.length; index++ )
			{
				let found_text = items[ index ];
				text = text.replace(
					`${Step.start_text}${found_text}${Step.end_text}`,
					`${Step.start_text}${value}${Step.end_text}` );
			}

			// Write the file.
			LIB_FS.writeFileSync( filename, text, 'utf8' );
			return true;
		},


	};

	// Return the command.
	return Command;
};
