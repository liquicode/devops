# @liquicode/devops

> Home: [http://devops.liquicode.com](http://devops.liquicode.com)
>
> Version: 0.0.18

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


Command Listing
=====================================================================

> See the [Command Reference](guides/Command-Reference.md) for full command documentation.



Child Process Commands
---------------------------------------------------------------------


### $Shell

> Execute a command line. Can redirect process output and errors.
> 
> **11 Fields** : `command`, `halt_on_error`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`, `err.console`, `err.log`, `err.filename`, `err.context`

___


Context Commands
---------------------------------------------------------------------


### $LoadJsModule

> Loads (requires) a Javascript module (.js) file into a context variable. Javascipt modules can contain data and/or functions and are accessible to other tasks.
> 
> **6 Fields** : `filename`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___

### $PrintContext

> Prints a context variable value to the output.
> 
> **6 Fields** : `context`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___

### $SemverInc

> Increments a semver formatted version number stored in the context.
> 
> **1 Fields** : `context`

___

### $SetContext

> Sets a field in the context.
> 
> **2 Fields** : `context`, `value`

___


File System Commands
---------------------------------------------------------------------


### $AppendTextFile

> Appends text to a file. The file is created if it does not exist.
> 
> **2 Fields** : `filename`, `value`

___

### $ClearFolder

> Removes all files from a folder.
> 
> **2 Fields** : `folder`, `recurse`

___

### $CopyFile

> Copies a file from one folder to another. If the destination path does not exist, it will be created
> 
> **2 Fields** : `from`, `to`

___

### $CopyFolder

> Copies a folder and its contents from one path to another.
> 
> **2 Fields** : `from`, `to`

___

### $EnsureFolder

> Makes sure that the specified folder exists. Creates the folder and any intermediate folders if needed.
> 
> **1 Fields** : `folder`

___

### $PrependTextFile

> Inserts text into the beginning of a file. The file is created if it does not exist.
> 
> **2 Fields** : `filename`, `value`

___

### $ReadJsonFile

> Reads the contents of a json file or field.
> 
> **7 Fields** : `filename`, `field`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___

### $ReadTextFile

> Reads the contents of a text file.
> 
> **6 Fields** : `filename`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___

### $RemoveFolder

> Removes a folder.
> 
> **2 Fields** : `folder`, `force`

___


Flow Control Commands
---------------------------------------------------------------------


### $Halt

> Halts execution of the current task.
> 
> **No Fields**

___

### $If

> Conditionally execute steps based on the state of the Context.
> 
> **3 Fields** : `criteria`, `then`, `else`

___

### $Noop

> Performs no operation and is ignored.
> 
> **No Fields**

___

### $RunSteps

> Runs a set of steps defined within this step.
> 
> **1 Fields** : `steps`

___

### $RunTask

> Runs another task found in the same devops task file.
> 
> **1 Fields** : `task`

___


Internet Commands
---------------------------------------------------------------------


### $GetResource

> Downloads a resource from the internet and stores it to a file and/or Context variable.
> 
> **7 Fields** : `url`, `as`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___


Scripting Commands
---------------------------------------------------------------------


### $ExecuteEjs

> Processes a document file or string containing Embedded Javascript (ejs) code.This command works in the same way as official ejs does (see: https://github.com/mde/ejs ).The return value of this comm...
> 
> **15 Fields** : `ejs_file`, `ejs_string`, `ejs_start`, `ejs_end`, `use_eval`, `debug_script.as`, `debug_script.console`, `debug_script.log`, `debug_script.filename`, `debug_script.context`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___

### $ExecuteJs

> Executes Javascript code within a string or a file.The code is essentially require'ed (or eval'ed) into the task and has full access to all of the nodejs functions.This can be extremely unsafe but i...
> 
> **8 Fields** : `code_file`, `code_string`, `use_eval`, `out.as`, `out.console`, `out.log`, `out.filename`, `out.context`

___


