'use strict';

const LIB_FS = require( 'fs' );

module.exports = parse_ejs_sections;

function parse_ejs_sections( Engine, Context, Filename, Script, EjsStart, EjsEnd )
{
	// Parse sections.
	let sections = [];
	let ich = 0;
	while ( ich < Script.length )
	{
		// Read up to the next ejs start.
		let ich1 = Script.indexOf( EjsStart, ich );
		if ( ich1 < ich ) 
		{
			// start code not found
			sections.push( {
				file: Filename,
				type: 'text',
				text: Script.substring( ich ),
			} );
			break;
		}
		else if ( ich1 > ich )
		{
			// start code was found downstream
			sections.push( {
				file: Filename,
				type: 'text',
				text: Script.substring( ich, ich1 ),
			} );
			ich = ich1;
		}
		else if ( ich1 === ich )
		{
			// start code was found here
			ich += EjsStart.length;
			// check for start code literal
			if ( Script[ ich ] === '%' )
			{
				// literal start code
				sections.push( {
					file: Filename,
					type: 'text',
					text: EjsStart,
				} );
				ich++;
				continue;
			}
			// get start code modifiers
			let start_modifiers = '';
			for ( let modifier_index = 0; modifier_index < 3; modifier_index++ )
			{
				if ( ich >= Script.length ) { break; }
				if ( Script[ ich ] === ' ' ) { break; }
				if ( '#*=-_'.includes( Script[ ich ] ) ) 
				{
					start_modifiers += Script[ ich ];
					ich++;
				}
			}
			// check to read to end of line
			if ( start_modifiers.includes( '*' ) )
			{
				// read to end of line
				ich1 = Script.indexOf( '\n', ich );
				if ( ich1 < 0 ) { ich1 = Script.indexOf( '\r', ich ); }
				if ( ich1 < 0 ) { ich1 = Script.length; }
				sections.push( {
					file: Filename,
					type: 'code',
					start_modifiers: start_modifiers,
					end_modifiers: '',
					text: Script.substring( ich, ich1 ),
				} );
				// sections.push( {
				// 	file: Filename,
				// 	type: 'text',
				// 	text: '\n',
				// } );
				ich = ich1 + 1;
				continue;
			}
			// get end code
			ich1 = Script.indexOf( EjsEnd, ich );
			if ( ich1 < 0 ) { ich1 = Script.length; }
			let section = {
				file: Filename,
				type: 'code',
				start_modifiers: start_modifiers,
				end_modifiers: '',
				text: Script.substring( ich, ich1 ),
			};
			if ( '-_'.includes( section.text[ section.text.length - 1 ] ) )
			{
				section.end_modifiers = section.text[ section.text.length - 1 ];
				section.text = section.text.substring( 0, section.text.length - 1 );
			}
			sections.push( section );
			ich = ich1 + EjsEnd.length;
		}
		else { throw new Error( `Unreachable code was reached!` ); } // unreachable code
	}

	// Check for includes.
	let section_index = 0;
	while ( section_index < sections.length )
	{
		let section = sections[ section_index ];
		if ( section.type === 'code' )
		{
			section.text = section.text.trim();
			if ( section.text.startsWith( 'include(' ) && section.text.endsWith( ')' ) )
			{
				let include_filename = section.text.substring( 8, section.text.length - 1 );
				include_filename = include_filename.trim();
				if ( include_filename )
				{
					include_filename = Engine.ResolvePath( Context, include_filename );
					let include_script = LIB_FS.readFileSync( include_filename, 'utf8' );
					let include_sections = parse_ejs_sections( Engine, Context, include_filename, include_script, EjsStart, EjsEnd );
					if ( include_sections && include_sections.length )
					{
						sections.splice( section_index, 1, ...include_sections );
						section_index += ( include_sections.length - 1 );
					}
				}
			}
		}
		section_index++;
	}

	// Return the sections.
	return sections;
};
