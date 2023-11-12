'use strict';

module.exports = {

	sync_version: [
		// Read the official package version.
		{ $ReadJsonField: { filename: 'package.json', context: 'Package' } },

		// Update files with the current version.
		{ $ReplaceFileText: { filename: 'version.md', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'docs/external/version.md', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'readme.md', start_text: 'v(', end_text: ')', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'docs/external/readme.md', start_text: 'v(', end_text: ')', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'docs/_coverpage.md', start_text: 'v(', end_text: ')', value: '${Package.version}' } },

	],

	build_docs: [

		// Run tests and capture output.
		{ $Shell: { command: 'npx mocha -u bdd tests/*.js --timeout 0 --slow 10', output: 'tests-output.md' } },

		// Copy files to the docs external area.
		{ $CopyFile: { from: 'readme.md', to: 'docs/external/readme.md' } },
		{ $CopyFile: { from: 'license.md', to: 'docs/external/license.md' } },
		{ $CopyFile: { from: 'version.md', to: 'docs/external/version.md' } },

	],

	new_version: [

		// Increment and update the official package version.
		{ $ReadJsonField: { filename: 'package.json', context: 'Package' } },
		{ $SemverInc: { value: '${Package.version}' } },
		{ $WriteJsonField: { filename: 'package.json', field: 'version', value: '${Package.version}' } },

		// Update the project files with the new version.
		{ $RunTask: { name: 'sync_version' } },

		// Run webpack.
		{ $Shell: { command: 'npx webpack-cli --config build/webpack.config.js' } },

		// Update aws s3 bucket with package docs.
		{ $Shell: { command: 'set "AWS_PROFILE=admin" & aws s3 sync docs s3://jsongin.liquicode.com' } },

		// Update npmjs.com with new package.
		{ $Shell: { command: 'npm publish . --access public' } },

	],

};
