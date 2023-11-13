'use strict';

module.exports = {

	clear: [

		{ $ClearFolder: { folder: '~temp/docs2', recursive: true } },
		{ $RemoveFolder: { folder: '~temp/docs2' } },

	],

	test: [

		{ $RunTask: { name: 'clear' } },
		{ $EnsureFolder: { folder: '~temp/docs2' } },
		{ $CopyFile: { from: '~temp/docs1/readme.md', to: '~temp/docs2/readme.md' } },
		{ $Shell: { command: 'dir', output: '~temp/docs2/dir-output.txt' } },
		{ $ReadJsonFile: { filename: 'package.json', context: 'Package' } },
		{ $SemverInc: { context: 'Package.version' } },
		{ $ReplaceFileText: { filename: '~temp/docs2/readme.md', start_text: 'v(', end_text: ')', value: '${Package.version}' } },
		{ $WriteTextFile: { filename: '~temp/docs2/version.md', value: '${Package.version}' } },
		{ $WriteJsonFile: { filename: '~temp/docs2/package.json', context: 'Package', friendly: true } },

	],

};
