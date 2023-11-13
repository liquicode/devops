'use strict';

module.exports = {


	//---------------------------------------------------------------------
	FindBetween: function ( Text, StartText, EndText, CaseSensitive = true ) 
	{
		if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
		if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
		if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
		if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
		if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }

		let work_text = Text;
		if ( !CaseSensitive ) 
		{
			work_text = work_text.toLowerCase();
			StartText = StartText.toLowerCase();
			EndText = EndText.toLowerCase();
		}

		// Find StartText
		let start_text_begin = 0;
		if ( StartText.length ) { start_text_begin = work_text.indexOf( StartText ); }
		if ( start_text_begin < 0 ) { return null; }

		// Find EndText
		let end_text_begin = work_text.length;
		if ( EndText.length ) { end_text_begin = work_text.indexOf( EndText, start_text_begin + StartText.length ); }
		if ( end_text_begin < 0 ) { return null; }

		let found_text = Text.substring( start_text_begin + StartText.length, end_text_begin );
		return found_text;
	},


	//---------------------------------------------------------------------
	ReplaceBetween: function ( Text, StartText, EndText, WithText, CaseSensitive = true ) 
	{
		if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
		if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
		if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
		if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
		if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }
		if ( typeof WithText !== 'string' ) { throw new Error( 'The parameter [WithText] must be a string.' ); }

		let found_text = find_between( Text, StartText, EndText, CaseSensitive );
		if ( found_text !== null ) 
		{
			Text = Text.replace( `${StartText}${found_text}${EndText}`, `${StartText}${WithText}${EndText}` );
		}
		return Text;
	},


	//---------------------------------------------------------------------
	GetObjectValue: function ( Document, Path )
	{
		let path_elements = Path.split( '.' );
		let data = Document;
		for ( let index = 0; index < path_elements.length; index++ )
		{
			let name = path_elements[ index ];
			if ( name === '' ) { continue; }
			if ( typeof data !== 'object' ) { return; }
			data = data[ name ];
		}
		return data;
	},


	//---------------------------------------------------------------------
	SetObjectValue: function ( Document, Path, Value )
	{
		let path_elements = Path.split( '.' );
		let data = Document;
		for ( let index = 0; index < path_elements.length; index++ )
		{
			let name = path_elements[ index ];
			if ( name === '' ) { continue; }
			if ( typeof data !== 'object' ) { return false; }
			if ( typeof data[ name ] === 'undefined' ) { data[ name ] = {}; }
			if ( index < ( path_elements.length - 1 ) )
			{
				data = data[ name ];
			}
			else
			{
				data[ name ] = Value;
			}
		}
		return true;
	},


};
