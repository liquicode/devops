'use strict';


const LIB_OS = require( 'os' );
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_CRYPTO = require( 'crypto' );


//---------------------------------------------------------------------
function TempFilename( Extension )
{
	let filename = `temp.${LIB_CRYPTO.randomBytes( 6 ).readUIntLE( 0, 6 ).toString( 36 )}.${Extension}`;
	filename = LIB_PATH.join( LIB_OS.tmpdir(), filename );
	return filename;
}


//---------------------------------------------------------------------
function FindAllBetween( Text, StartText, EndText, Options ) 
{
	if ( typeof Text !== 'string' ) { throw new Error( 'FindAllBetween: The parameter [Text] must be a string.' ); }
	if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
	if ( typeof StartText !== 'string' ) { throw new Error( 'FindAllBetween: The parameter [StartText] must be a string or null.' ); }
	if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
	if ( typeof EndText !== 'string' ) { throw new Error( 'FindAllBetween: The parameter [EndText] must be a string or null.' ); }
	if ( ( Options === undefined ) || ( Options === null ) ) { Options = {}; }
	if ( Options.MaxResults === undefined ) { Options.MaxResults = -1; }

	let results = [];
	let start_search = 0;

	while ( start_search < Text.length )
	{
		if ( ( Options.MaxResults >= 0 ) && ( results.length >= Options.MaxResults ) ) { break; }

		// Find StartText
		let start_text_begin = start_search;
		if ( StartText.length ) { start_text_begin = Text.indexOf( StartText, start_search ); }
		if ( start_text_begin < 0 ) { break; }

		// Find EndText
		let end_text_begin = Text.length;
		if ( EndText.length ) { end_text_begin = Text.indexOf( EndText, start_text_begin + StartText.length ); }
		if ( end_text_begin < 0 ) { break; }

		// Found Text.
		let found = Text.substring( start_text_begin + StartText.length, end_text_begin );
		results.push( found );
		start_search = end_text_begin + EndText.length;
	}

	return results;
}


// //---------------------------------------------------------------------
// function ReplaceAllBetween( Text, StartText, EndText, WithText, Options ) 
// {
// 	if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
// 	if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
// 	if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
// 	if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
// 	if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }
// 	if ( ( Options === undefined ) || ( Options === null ) ) { Options = {}; }
// 	if ( Options.MaxResults === undefined ) { Options.MaxResults = -1; }
// 	if ( Options.ReplaceTokens === undefined ) { Options.ReplaceTokens = false; }

// 	let found_items = FindAllBetween( Text, StartText, EndText, Options );
// 	for ( let index = 0; index < found_items.length; index++ )
// 	{
// 		let found_text = found_items[ index ];
// 		if ( Options.ReplaceTokens )
// 		{
// 			Text = Text.replace( `${StartText}${found_text}${EndText}`, WithText );
// 		}
// 		else
// 		{
// 			Text = Text.replace( found_text, WithText );
// 		}
// 	}

// 	return Text;
// }


// //---------------------------------------------------------------------
// function FindBetween( Text, StartText, EndText, CaseSensitive = true ) 
// {
// 	if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
// 	if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
// 	if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
// 	if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
// 	if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }

// 	let work_text = Text;
// 	if ( !CaseSensitive ) 
// 	{
// 		work_text = work_text.toLowerCase();
// 		StartText = StartText.toLowerCase();
// 		EndText = EndText.toLowerCase();
// 	}

// 	// Find StartText
// 	let start_text_begin = 0;
// 	if ( StartText.length ) { start_text_begin = work_text.indexOf( StartText ); }
// 	if ( start_text_begin < 0 ) { return null; }

// 	// Find EndText
// 	let end_text_begin = work_text.length;
// 	if ( EndText.length ) { end_text_begin = work_text.indexOf( EndText, start_text_begin + StartText.length ); }
// 	if ( end_text_begin < 0 ) { return null; }

// 	let found_text = Text.substring( start_text_begin + StartText.length, end_text_begin );
// 	return found_text;
// }


// //---------------------------------------------------------------------
// function ReplaceBetween( Text, StartText, EndText, WithText, CaseSensitive = true ) 
// {
// 	if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
// 	if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
// 	if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
// 	if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
// 	if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }
// 	if ( typeof WithText !== 'string' ) { throw new Error( 'The parameter [WithText] must be a string.' ); }

// 	let found_text = FindBetween( Text, StartText, EndText, CaseSensitive );
// 	if ( found_text !== null ) 
// 	{
// 		Text = Text.replace( `${StartText}${found_text}${EndText}`, `${StartText}${WithText}${EndText}` );
// 	}
// 	return Text;
// }


//---------------------------------------------------------------------
function GetObjectValue( Document, Path )
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
}


//---------------------------------------------------------------------
function SetObjectValue( Document, Path, Value )
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
}


//---------------------------------------------------------------------
module.exports = {
	TempFilename: TempFilename,
	FindAllBetween: FindAllBetween,
	// FindBetween: FindBetween,
	// ReplaceBetween: ReplaceBetween,
	GetObjectValue: GetObjectValue,
	SetObjectValue: SetObjectValue,
	SetObjectValue: SetObjectValue,
};
