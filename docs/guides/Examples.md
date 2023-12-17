

Examples
=====================================================================

This is a `.js` tasks file that exports task definition as module loaded by `devops`:

```js
module.exports = {

	clear: [

		{ $ClearFolder: { folder: '~temp/docs2', recursive: true } },
		{ $RemoveFolder: { folder: '~temp/docs2' } },

	],

	do_stuff: [

		// Run a task to clear our working area.
		{ $RunTask: { task: 'clear' } },

		// Do some file management stuff.
		{ $EnsureFolder: { folder: '~temp/docs2' } },
		{ $CopyFile: { from: '~temp/docs1/readme.md', to: '~temp/docs2/readme.md' } },
		{ $Shell: { command: 'dir', out: { filename: '~temp/docs2/dir-output.txt' } } },

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
