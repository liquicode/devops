'use strict';

const ShellColors = require( './ShellColors' )();

module.exports = function ( Settings )
{
	let Log = {


		//---------------------------------------------------------------------
		_Indent: 0,


		//---------------------------------------------------------------------
		Indent: function () 
		{
			Log._Indent++;
			return;
		},


		//---------------------------------------------------------------------
		Unindent: function () 
		{
			Log._Indent--;
			if ( Log._Indent < 0 ) { Log._Indent = 0; }
			return;
		},


		//---------------------------------------------------------------------
		Print: function ( Text ) 
		{
			for ( let index = 0; index < Log._Indent; index++ )
			{
				Text = `  ${Text}`;
			}
			console.log( Text );
			return;
		},


		//---------------------------------------------------------------------
		BlankLine: function () 
		{
			Log.Print( '' );
			return;
		},


		//---------------------------------------------------------------------
		Heading: function ( Text ) 
		{
			if ( Settings.Colors )
			{
				Text = ShellColors.ShellText( Text, null, ShellColors.ShellForecolor.White, ShellColors.ShellEffect.Bold );
			}
			Log.Print( Text );
			return;
		},


		//---------------------------------------------------------------------
		Muted: function ( Text ) 
		{
			if ( Settings.Colors )
			{
				Text = ShellColors.ShellText( Text, null, ShellColors.ShellForecolor.LightGray, ShellColors.ShellEffect.Dim );
			}
			Log.Print( Text );
			return;
		},


		//---------------------------------------------------------------------
		Error: function ( Text ) 
		{
			if ( Settings.Colors )
			{
				Text = ShellColors.ShellText( Text, null, ShellColors.ShellForecolor.Red, ShellColors.ShellEffect.Bold );
			}
			Log.Print( Text );
			return;
		},


	};
	return Log;
};
