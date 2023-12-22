
function PrintCommandHelpSummary()
{

	let all_commands = Object.values( Engine.Commands );
	let categories = jsongin.Distinct( all_commands, { 'Meta.Category': 1 } );
	for ( let category_index = 0; category_index < categories.length; category_index++ )
	{
		let category_name = categories[ category_index ].Meta.Category;
		Output.printline( `` );
		Output.printline( `` );
		Output.printline( `## ${category_name} Commands` );
		// Output.printline( '='.repeat( 69 ) );
		Output.printline( `` );
		let commands = jsongin.Filter( all_commands, { 'Meta.Category': category_name } );
		for ( let command_index = 0; command_index < commands.length; command_index++ )
		{
			let command = commands[ command_index ].Meta;
			Output.printline( `` );
			Output.printline( `### ${command.CommandName}` );
			// Output.printline( '-'.repeat( 69 ) );
			// Description
			Output.printline( `` );
			switch ( jsongin.ShortType( command.CommandHelp ) )
			{
				case 's':
					let text = command.CommandHelp;
					if ( text.length > 120 ) { text = text.substring( 0, 120 ) + '...'; }
					Output.printline( `> ${text}` );
					Output.printline( `> ` );
					break;
				case 'a':
					for ( let help_index = 0; help_index < command.CommandHelp.length; help_index++ )
					{
						let text = command.CommandHelp[ help_index ];
						if ( text.length > 120 ) { text = text.substring( 0, 120 ) + '...'; }
						Output.printline( `> ${text}` );
						Output.printline( `> ` );
						break;
					}
					break;
			}
			// Fields
			let field_list = [];
			for ( let field_index = 0; field_index < command.CommandFields.length; field_index++ )
			{
				let field = command.CommandFields[ field_index ];
				field_list.push( '`' + field.name + '`' );
			}
			if ( field_list.length )
			{
				Output.printline( `> **${field_list.length} Fields** : ${field_list.join( ', ' )}` );
			}
			else
			{
				Output.printline( `> **No Fields**` );
			}
			// More Info
			let slug = command.CommandName.substring( 1 ).toLowerCase();
			Output.printline( `> ` );
			Output.printline( `> [More ...](guides/Command-Reference?id=${slug})` );
			Output.printline( `> ` );
			// Page Seperator
			Output.printline( `___` );
		}
	}

	return;
}


function PrintCommandHelpDetail()
{

	let all_commands = Object.values( Engine.Commands );
	let categories = jsongin.Distinct( all_commands, { 'Meta.Category': 1 } );
	for ( let category_index = 0; category_index < categories.length; category_index++ )
	{
		// Category
		let category_name = categories[ category_index ].Meta.Category;
		Output.printline( `` );
		Output.printline( `` );
		Output.printline( `# ${category_name} Commands` );
		// Output.printline( '='.repeat( 69 ) );
		Output.printline( `` );
		let commands = jsongin.Filter( all_commands, { 'Meta.Category': category_name } );
		for ( let command_index = 0; command_index < commands.length; command_index++ )
		{
			let command = commands[ command_index ].Meta;
			// Command Name
			Output.printline( `` );
			Output.printline( `## ${command.CommandName}` );
			// Output.printline( '-'.repeat( 69 ) );
			Output.printline( `` );
			// Command Help
			switch ( jsongin.ShortType( command.CommandHelp ) )
			{
				case 's':
					let text = command.CommandHelp;
					Output.printline( `${text}` );
					Output.printline( `` );
					break;
				case 'a':
					for ( let help_index = 0; help_index < command.CommandHelp.length; help_index++ )
					{
						let text = command.CommandHelp[ help_index ];
						Output.printline( `${text}` );
						Output.printline( `` );
					}
					break;
			}
			// Command Fields
			Output.printline( `**${command.CommandFields.length} Fields:**` );
			Output.printline( `` );
			if ( command.CommandFields && command.CommandFields.length )
			{
				Output.printline( `| Name | Type | Default | Description |` );
				Output.printline( `|------|------|---------|-------------|` );
				for ( let field_index = 0; field_index < command.CommandFields.length; field_index++ )
				{
					let field = command.CommandFields[ field_index ];
					let default_text = '';
					if ( typeof field.default === 'undefined' ) { default_text = '(reqd)'; }
					else { default_text = JSON.stringify( field.default ); }
					Output.printline( `| ${field.name} | ${field.type} | ${default_text} | ${field.description} |` );
				}
				Output.printline( `` );
			}
			// Examples
			if ( command.Examples && command.Examples.length )
			{
				Output.printline( `**Examples:**` );
				for ( let example_index = 0; example_index < command.Examples.length; example_index++ )
				{
					let step = command.Examples[ example_index ];
					let text = jsongin.Format( command.Examples[ 0 ], true, true );
					Output.printline( '```js' );
					Output.printline( text );
					Output.printline( '```' );
				}
			}
			Output.printline( `___` );
		}
	}

	return;
}

