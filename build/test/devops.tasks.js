'use strict';

module.exports = {

	Context: {
		TempFolder: 'test/~temp',
		DataFolder: 'test/data',
	},

	clear: [

		{ $ClearFolder: { folder: '${TempFolder}', recursive: true } },
		// { $RemoveFolder: { folder: '${TempFolder}' } },

	],

	test: [

		// { $Shell: { command: 'dir foo', output: 'console', errors: 'console', halt_on_error: false } },
		{ $RunTask: { task: 'clear' } },
		{ $CopyFile: { from: '${DataFolder}/docs/license.md', to: '${TempFolder}/docs/license.md' } },
		{ $Shell: { command: 'dir ${DataFolder}', halt_on_error: false, out: { console: true, filename: '${TempFolder}/docs/dir-output.txt' }, err: { console: true } } },
		{ $ReadJsonFile: { filename: 'package.json', out: { context: 'Package' } } },
		{ $SemverInc: { context: 'Package.version' } },
		// { $ReplaceFileText: { filename: '~temp/docs2/readme.md', start_text: 'v(', end_text: ')', value: '${Package.version}' } },
		{ $PrintContext: { context: 'Package.version', out: { console: true, filename: '${TempFolder}/docs/version.md' } } },
		{ $PrintContext: { context: 'Package', out: { as: 'json-friendly', filename: '${TempFolder}/docs/package.json' } } },

	],

};
