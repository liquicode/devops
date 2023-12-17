# @liquicode/devops

> Home: [http://devops.liquicode.com](http://devops.liquicode.com)
>
> Version: 0.0.15

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



Child Process Commands
---------------------------------------------------------------------


### $Shell

Execute a command line. Can redirect process output and errors.

**11 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | command | s | (reqd) | The command line to execute. |
> | halt_on_error | b | true | Set to false to ignore errors and continue processing this task. Defaults to true. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
> | err.console | b | false | Send errors to the console (i.e. console.error). |
> | err.log | b | false | Send errors to the devop's error log. |
> | err.filename | s | "" | Send errors to a file. |
> | err.context | s | "" | The name of a Context field to send the errors to. |
___


Context Commands
---------------------------------------------------------------------


### $LoadJsModule

Loads (requires) a Javascript module (.js) file into a context variable. Javascipt modules can contain data and/or functions and are accessible to other tasks.

**6 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | filename | s | (reqd) | The Javascript module file to load. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___

### $PrintContext

Prints a context variable value to the output.

**6 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | context | s | "" | The name of the Context field to send to the output. Leave empty to send the entire Context. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___

### $SemverInc

Increments a semver formatted version number stored in the context.

**1 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | context | s | (reqd) | The name of the Context field containing a semver formatted version number. |
___

### $SetContext

Sets a field in the context.

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | context | s | (reqd) | The name of the Context field to store the value to. |
> | value |  | (reqd) | The value to set. |
___


File System Commands
---------------------------------------------------------------------


### $AppendTextFile

Appends text to a file. The file is created if it does not exist.

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | filename | s | (reqd) | The name of the file to write to. |
> | value | s | (reqd) | The text value to write to the file. |
___

### $ClearFolder

Removes all files from a folder.

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | folder | s | (reqd) | The folder to remove files from. |
> | recurse | b | false | If true, removes all sub-folders and files as well. |
___

### $CopyFile

Copies a file from one folder to another. If the destination path does not exist, it will be created

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | from | s | (reqd) | The file to copy. |
> | to | s | (reqd) | The destination filename of the file to copy. |
___

### $CopyFolder

Copies a folder and its contents from one path to another.

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | from | s | (reqd) | The folder to copy from. |
> | to | s | (reqd) | The destination path of the copied folder. |
___

### $EnsureFolder

Makes sure that the specified folder exists. Creates the folder and any intermediate folders if needed.

**1 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | folder | s | (reqd) | The folder to ensure/create. |
___

### $PrependTextFile

Inserts text into the beginning of a file. The file is created if it does not exist.

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | filename | s | (reqd) | The name of the file to write to. |
> | value | s | (reqd) | The text value to write to the file. |
___

### $ReadJsonFile

Reads the contents of a json file or field.

**7 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | filename | s | (reqd) | The json file to read. |
> | field | s | "" | The name of the field to read. Leave empty to read the entire json object. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___

### $ReadTextFile

Reads the contents of a text file.

**6 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | filename | s | (reqd) | The text file to read. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___

### $RemoveFolder

Removes a folder.

**2 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | folder | s | (reqd) | The folder to remove. |
> | force | b | false | If true, removes the folder even if it is not empty. |
___


Flow Control Commands
---------------------------------------------------------------------


### $Halt

Halts execution of the current task.

**0 Fields**

___

### $If

Conditionally execute steps based on the state of the Context.

**3 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | criteria | o | (reqd) | A jsongin query criteria to match against the Context. |
> | then | a | [] | Steps to run when the condition is true. |
> | else | a | [] | Steps to run when the condition is false. |
___

### $Noop

Performs no operation and is ignored.

**0 Fields**

___

### $RunSteps

Runs a set of steps defined within this step.

**1 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | steps | a | (reqd) | An array of steps to run. |
___

### $RunTask

Runs another task found in the same devops task file.

**1 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | task | s | (reqd) | The name of the task to run. |
___


Internet Commands
---------------------------------------------------------------------


### $GetResource

Downloads a resource from the internet and stores it to a file and/or Context variable.

**7 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | url | s | (reqd) | The URL of the resource. |
> | as | s | "binary" | Format of the resource, one of: 'binary', 'string', 'json'. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___


Scripting Commands
---------------------------------------------------------------------


### $ExecuteEjs

Processes a document file or string containing Embedded Javascript (ejs) code.This command works in the same way as official ejs does (see: https://github.com/mde/ejs).The return value of this command is a text string containing the processed document after all embedded js code has been executed.This returned string can be written to a file and/or stored in a Context variable.This is a text based process and should work on any text based document (e.g. html, md, xml, json, etc.).Embedded code has access to the Task's 'Context' object and is able to modify it.Code also has access to an 'Output' object which lets it print text directly to the final document.Supports the following ejs tags (from official ejs docs (https://ejs.co/#docs)):- <%  :'Scriptlet' tag, for control-flow, no output- <%_ : 'Whitespace Slurping' Scriptlet tag, strips all whitespace before it- <%= : Outputs the value into the template (HTML escaped)- <%- : Outputs the unescaped value into the template- <%# : Comment tag, no execution, no output- <%% : Outputs a literal '<%'-  %> : Plain ending tag- -%> : Trim-mode ('newline slurp') tag, trims following newline- _%> : 'Whitespace Slurping' ending tag, removes all whitespace after itShortcut for a single line of code:'<%*' treats entire rest of the line as code.No closing tag should be provided.Can be combined with other start tag modifiers (e.g. <%*- or <%-* ).A side effect of using '*' is that no newline will be printed after it,making it very useful when used alone '<%*' but confusing when used with other modifiers.If you see an error like '$ExecuteEjs threw an error: missing ) after argument list',check to make sure you haven't also included a closing tag after using '*'.Include other ejs files:Use the 'include' statement to include other ejs files.Must appear by itself within a code section and contain the path of the file to include.ex: '<% include( docs/_partials/heading.ejs ) %>' Note the absence of quotes surrounding the filename.Like all other filenames, it must be represented relative to the package folder.Differences from official ejs:- Can execute embedded code using "require()" or "eval()". Official ejs uses only "eval()".- The '*' tag modifier is not part of offical ejs.- The 'include' statement requires a path relative to the package folder. With official ejs you can specify a full path or a path relative to the including file.- The @liquicode/jsongin library is preloaded and available as 'jsongin' within the code.

**15 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | ejs_file | s | "" | The path to an Embedded Javascript file to load and execute. |
> | ejs_string | s | "" | A string of Embedded Javascript code to execute. Either this or code_file should be used. |
> | ejs_start | s | "<%" | Token to delineate the beginning of an embedded js section. Defaults to "<%", set to empty to disable embedded js. |
> | ejs_end | s | "%>" | Token to delineate the end of an embedded js section. Defaults to "%>". |
> | use_eval | b | true | Forces the processor to use "eval()" (instead of "require()") for code execution. |
> | debug_script.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | debug_script.console | b | false | Send output to the console (i.e. console.log). |
> | debug_script.log | b | false | Send output to the devop's log. |
> | debug_script.filename | s | "" | Send output to a file. |
> | debug_script.context | s | "" | The name of a Context field to send the output to. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___

### $ExecuteJs

Executes Javascript code within a string or a file.The code is essentially require'ed (or eval'ed) into the task and has full access to all of the nodejs functions.This can be extremely unsafe but it also gives you much more flexibility.The Javascript code will have access to the Task Context (as 'Context') and be able to modify it.The @liquicode/jsongin library is preloaded and available as 'jsongin' within the code.

**8 Fields**

> | Name | Type | Default | Description |
> |------|------|---------|-------------|
> | code_file | s | "" | The path to a Javascript file to load and execute. |
> | code_string | s | "" | A string of Javascript code to execute. Either this or code_file should be used. |
> | use_eval | b | true | Forces the processor to use "eval()" (instead of "require()") for code execution. |
> | out.as | s | "" | Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion. |
> | out.console | b | false | Send output to the console (i.e. console.log). |
> | out.log | b | false | Send output to the devop's log. |
> | out.filename | s | "" | Send output to a file. |
> | out.context | s | "" | The name of a Context field to send the output to. |
___


