# DevOps
[@liquicode/devops](https://github.com/liquicode/devops) (v0.0.15)

### A utility for devops, CI/CD, and general automation.


Overview
---------------------------------------------------------------------

`devops` runs tasks and commands that are defined as Javascript objects.
These Javascript objects live as `.json` (or `.js`) files that are loaded and executed by `devops`.
Commands perform actions on your environment such as copying a file or running a shell command.
Each command has specific paramters that map to function parameters in a function call.
For example, the `$CopyFile` command requires `from` and `to` paramteters to tell it which file to copy to where.

Related commands are grouped together into a single object called a task.
Tasks can be executed via the `devops` command line, making tasks runnable from batch/shell files or other types of tools.
Tasks can also call other tasks, allowing you to define functional units that can be reused within your tasks file.

When `devops` runs, it tries to find a `package.json` file, either in the current directory or one of its parents.
All commands are run from the folder containing the `package.json`.
This means all of your paths and filenames are relative to the `package.json` folder.

`devops` can also store variable values that are the result of and to be used with commands.
This set of variables is called the context and is global/shared to all tasks within a file.
Context variables can be referenced from within string values by using the `${variable-name}` notation.


Getting Started
---------------------------------------------------------------------

***Install with NPM:***
```shell
# Install locally into your project:
npm install --save @liquicode/devops
# - or -
# Install globally onto your machine:
npm install --global @liquicode/devops
```

***Run from the command line***
```shell
# Use the npx command to resolve the installation of devops and run it.
# This works if installed locally or globally.
# This works even if not installed. Npx will find the latest version online and run it.
npx @liquicode/devops
```


Command Line Parameters
---------------------------------------------------------------------

All command line paramters are optional.

- `package_folder` : The folder of the found `package.json` file.
- `package_filename` : (Aliases: `package` or `p`) : Full path of the `package.json` file
- `tasks_filename` : (Aliases: `tasks` or `t`)
- `task_name` : 


Commands
---------------------------------------------------------------------

### Context Commands

- `$PrintContext { context: 'variable-name' }`

- `$SetContext { context: 'variable-name', value: <any> }`

- `$SemverInc:{ context: 'variable-name' }`


### File System Commands

***Folders***

- `$EnsureFolder { folder: <string> }` :
  Makes sure that the specified folder exists. Creates the folder if needed.

- `$ClearFolder { folder: <string>, recurse: <boolean>, remove_folders: <boolean> }` :
- `$RemoveFolder`
- `$CopyFolder`

***Files***
- `$CopyFile`

***Json Files***
- `$ReadJsonFile`
- `$WriteJsonFile`

***Text Files***
- `$ReadTextFile`
- `$ReplaceFileText`
- `$PrependTextFile`
- `$AppendTextFile`
- `$WriteTextFile`


### Flow Control Commands

- `$Halt`
- `$Noop`
- `$RunTask`


### Command Processes

- `$Shell`


### Scripting Commands

- `$LoadJsModule`
- `$LoadDocuments`
- `$ExecuteJs`
- `$ExecuteEjs`


Examples
---------------------------------------------------------------------

This is a `.js` tasks file that exports task definition as module loaded by `devops`:

```js
module.exports = {

	clear: [

		{ $ClearFolder: { folder: '~temp/docs2', recursive: true } },
		{ $RemoveFolder: { folder: '~temp/docs2' } },

	],

	do_stuff: [

		// Run a task to clear our working area.
		{ $RunTask: { name: 'clear' } },

		// Do some file management stuff.
		{ $EnsureFolder: { folder: '~temp/docs2' } },
		{ $CopyFile: { from: '~temp/docs1/readme.md', to: '~temp/docs2/readme.md' } },
		{ $Shell: { command: 'dir', output: '~temp/docs2/dir-output.txt' } },

		// Read the package.json file and increment the version number field.
		{ $ReadJsonFile: { filename: 'package.json', context: 'Package' } },
		{ $SemverInc: { context: 'Package.version' } },
		{ $WriteJsonFile: { filename: '~temp/docs2/package.json', context: 'Package', friendly: true } },

		// Update some files with the new version number.
		{ $ReplaceFileText: { filename: '~temp/docs2/readme.md', start_text: 'v(', end_text: ')', value: '${Package.version}' } },
		{ $WriteTextFile: { filename: '~temp/docs2/version.md', value: '${Package.version}' } },

	],

};
```

Tasks within this file can executed by running the following at the shell prompt.
In this example, tasks are defined in a file called `devops.tasks.json` which is located in the
  same folder as the project's `package.json` file.
Also, this command can be run from anywhere within the package folder.

```shell
npx @liquicode/devops do_stuff
```
