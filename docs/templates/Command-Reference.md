# Command Reference

<%

	let all_commands = Object.values( Engine.Commands );
	let categories = jsongin.Distinct( all_commands, { 'Meta.Category': 1 } );
	for( let category_index = 0; category_index < categories.length; category_index++ )
	{
		let category_name = categories[ category_index ].Meta.Category;
		Output.printline( `` );
		Output.printline( `` );
		Output.printline( `${category_name} Commands` );
		Output.printline( '='.repeat( 69 ) );
		Output.printline( `` );
		let commands = jsongin.Filter( all_commands, { 'Meta.Category': category_name } );
		for( let command_index = 0; command_index < commands.length; command_index++ )
		{
			let command = commands[ command_index ].Meta;
			Output.printline( `` );
			Output.printline( `${command.CommandName}` );
			Output.printline( '-'.repeat( 69 ) );
			Output.printline( `` );
			Output.printline( `${command.CommandHelp}` );
			Output.printline( `` );
			Output.printline( `**${command.CommandFields.length} Fields**` );
			Output.printline( `` );
			if( command.CommandFields.length )
			{
				Output.printline( `> | Name | Type | Default | Description |` );
				Output.printline( `> |------|------|---------|-------------|` );
				for( let field_index = 0; field_index < command.CommandFields.length; field_index++ )
				{
					let field = command.CommandFields[ field_index ];
					let default_text = '';
					if( typeof field.default === 'undefined' ) { default_text = '(reqd)'; }
					else { default_text = JSON.stringify( field.default ); }
					Output.printline( `> | ${field.name} | ${field.type} | ${default_text} | ${field.description} |` );
				}
			}
			Output.printline( `___` );
		}
	}

%>