'use strict';

const ShellColors = require( './ShellColors' )();

module.exports = {

	PrintCommandList: function ( devops, MaxLineLength = 100 )
	{
		devops.Log.Heading( 'Help: List of Commands' );
		devops.Log.Heading( ShellColors.BoxChars.Horiz.repeat( 42 ) );
		let all_commands = Object.values( devops.Commands );
		let categories = devops.jsongin.Distinct( all_commands, { 'Meta.Category': 1 } );
		categories.forEach( category =>
		{
			let category_name = category.Meta.Category;
			devops.Log.Heading( category_name );
			let commands = devops.jsongin.Filter( all_commands, { 'Meta.Category': category_name } );
			commands.forEach( command =>
			{
				let line = `  - ${command.Meta.CommandName} : ${command.Meta.CommandHelp}`;
				if ( line.length > MaxLineLength )
				{
					line = line.substring( 0, MaxLineLength - 3 ) + '...';
				}
				devops.Log.Print( line );
			} );
		} );
		return;
	},


	PrintCommandsLike: function ( devops, LikeText, MaxLineLength = 100 )
	{
		devops.Log.Heading( `Help: Search for [${LikeText}]` );
		devops.Log.Heading( ShellColors.BoxChars.Horiz.repeat( 42 ) );
		Object.values( devops.Commands ).forEach( command =>
		{
			if ( !command.Meta.CommandName.toLowerCase().includes( LikeText.toLowerCase() ) ) { return; }
			let line = `- ${command.Meta.CommandName} : ${command.Meta.CommandHelp}`;
			if ( line.length > MaxLineLength )
			{
				line = line.substring( 0, MaxLineLength - 3 ) + '...';
			}
			devops.Log.Print( line );
		} );
		return;
	},


	PrintCommandDetail: function ( devops, CommandName, MaxLineLength = 100  )
	{
		let command = devops.Commands[ CommandName.toLowerCase() ];
		if ( typeof command === 'undefined' )
		{
			devops.Log.Error( `${CommandName} is not a loaded command.` );
			this.PrintCommandsLike( devops, CommandName, MaxLineLength );
			return;
		}
		devops.Log.Heading( 'Help: ' + CommandName );
		devops.Log.Heading( ShellColors.BoxChars.Horiz.repeat( 42 ) );
		devops.Log.Print( 'Category    : ' + command.Meta.Category );
		devops.Log.Print( 'Name        : ' + command.Meta.CommandName );
		devops.Log.Print( 'Description : ' + command.Meta.CommandHelp );
		devops.Log.Print( `  ${command.Meta.CommandFields.length} Fields` );
		console.table( command.Meta.CommandFields );
		return;
	},


};