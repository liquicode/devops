'use strict';

const ShellColors = require( './ShellColors' );

module.exports = {


	//---------------------------------------------------------------------
	Print: function ( Text ) 
	{
		if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
		console.log( Text );
		return;
	},


};
