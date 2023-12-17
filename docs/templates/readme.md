# <%- Engine.Library.name %>

> Home: [<%- Engine.Library.url %>](<%- Engine.Library.url %>)
>
> Version: <%- Engine.Library.version %>

### A utility for devops, CI/CD, and general automation.


Quick Start
=====================================================================

***Install with NPM:***
```shell
# Install locally into your project:
npm install --save @liquicode/devops
# - or -
# Install globally onto your machine for all your projects:
npm install --global @liquicode/devops
```

***Run from the command line***
```shell
# Use the npx command to resolve the installation of devops and run it.
# This works if installed locally or globally.
# This works even if not installed. Npx will find the latest version online and run it.
npx @liquicode/devops <taskfile>
```

See below for more command line options.


Overview
=====================================================================

`devops` is a command runner that executes commands that are defined as Javascript objects and are stored within a json/js "tasks" file.

Commands, Steps, and Tasks
---------------------------------------------------------------------

Commands perform actions on your environment such as copying files or running a shell command.
Each command has specific parameters that provide the command with specific details of what to do.
For example, the `$CopyFile` command requires `from` and `to` paramteters to tell it which file to copy and to where
Each command specifies its parameters as a Javascript object.

```js
{ $CopyFile: { from: 'readme.md', to: 'docs/readme.md' } } // A single step
```

Commands are grouped together as steps within a task.
Tasks provide logical units that can be executed directly via the `devops` command line,
making tasks runnable from batch/shell files or other types of tools.
Each task defines an array of steos.

```js
{
	clear_folder: [ //  <-- A Task
		{ $RemoveFolder: { folder: 'data/temp', force: true } }, // <-- Steps in a task
		{ $EnsureFolder: { folder: 'data/temp' } },              // <-- Steps in a task
	],
}
```

The Tasks File
---------------------------------------------------------------------

Multiple tasks can be defined within a single tasks file.
You can use the `$RunTask` command in one task to run another task within the same file.

```js
{
	clear_folder: [
		{ $RemoveFolder: { folder: 'data/temp', force: true } },
		{ $EnsureFolder: { folder: 'data/temp' } },
	],
	build_docs: [
		{ $RunTask: { task: 'clear_folder' } },
		...
	],
}
```

The Task Context
---------------------------------------------------------------------

Each task file maintains a `Context` object that is shared among all tasks and steps within a file.
Many of the `devops` commands have the ability to read and write values into the `Context` object.
You can specify an initial context within the tasks file.

```js
{
	// Initial context values for this file
	Context: {
		message: 'Hello World!',
	},
	// Tasks ...
	default: [
		{ $PrintContext: { context: 'message', out: { console: true } } },
	],
}
// Prints: Hello World!
```

Context variables can be referenced within string values by using the `${variable-name}` notation.

```js
{
	Context: { temp_folder: 'files/temp' },
	default: [
		{ $CopyFile: { from: 'data.json', to: '${temp_folder}/data.json' } },
	],
}
```


Example Tasks File
---------------------------------------------------------------------

The `.js` version of a tasks file:
```js
module.exports = {
	// Optional context initialization.
	Context: {
		message: 'Hello World!',
	},
	// Tasks ...
	Task1: [ Step1, Step2, ... ],
	Task2: [ ... ],
	...
};
```


Command Line Parameters
=====================================================================

When `devops` runs, it loads a tasks file and executes all commands in relation to the current working directory.

All command line parameters are optional.

- `execution_folder` : Makes this folder the current working directory during execution. Defaults to the process' current working directory.
- `package_filename` : A `package.json` file to load and store into the Context as `package`. Will also change the `execution_folder` to this folder. (Aliases: `package` or `p`)
- `tasks_filename` : The tasks file containing commands to execute. If this is not specified, `devops` looks for a `devops.tasks.js` or a `devops.tasks.json` file. (Aliases: `tasks` or `t`)
- `task_name` : The name of the task within the tasks file to run. If not specified, a task called `default` will be run.


Commands Reference
=====================================================================

<%

	let all_commands = Object.values( Engine.Commands );
	let categories = jsongin.Distinct( all_commands, { 'Meta.Category': 1 } );
	for( let category_index = 0; category_index < categories.length; category_index++ )
	{
		let category_name = categories[ category_index ].Meta.Category;
		Output.printline( `` );
		Output.printline( `` );
		Output.printline( `${category_name} Commands` );
		Output.printline( '-'.repeat( 69 ) );
		Output.printline( `` );
		let commands = jsongin.Filter( all_commands, { 'Meta.Category': category_name } );
		for( let command_index = 0; command_index < commands.length; command_index++ )
		{
			let command = commands[ command_index ].Meta;
			Output.printline( `` );
			Output.printline( `### ${command.CommandName}` );
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

