'use strict';

module.exports = {

	run_tests: [

		// Run tests and capture the output.
		{ $Shell: { command: 'npx mocha -u bdd tests/*.js --timeout 0 --slow 10', output: 'tests.md' } },

	],

	build_docs: [

		// Copy files to the docs external area.
		{ $EnsureFolder: { folder: 'docs/external' } },
		{ $CopyFile: { from: 'readme.md', to: 'docs/external/readme.md' } },
		{ $CopyFile: { from: 'license.md', to: 'docs/external/license.md' } },
		{ $CopyFile: { from: 'version.md', to: 'docs/external/version.md' } },
		{ $CopyFile: { from: 'tests.md', to: 'docs/external/tests.md' } },

	],

	sync_version: [
		// Read the official package version.
		{ $ReadJsonFile: { filename: 'package.json', context: 'Package' } },

		// Update files with the current version.
		{ $ReplaceFileText: { filename: 'version.md', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'docs/external/version.md', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'readme.md', start_text: '(v', end_text: ')', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'docs/external/readme.md', start_text: '(v', end_text: ')', value: '${Package.version}' } },
		{ $ReplaceFileText: { filename: 'docs/_coverpage.md', start_text: '(v', end_text: ')', value: '${Package.version}' } },

	],

	update_aws_docs: [

		// Update aws s3 bucket with package docs.
		{ $Shell: { command: 'set "AWS_PROFILE=admin" & aws s3 sync docs s3://devops.liquicode.com' } },

	],

	npm_publish: [

		// Update npmjs.com with new package.
		// { $Shell: { command: 'npm publish . --access public' } },

	],

	webpack: [

		// Run webpack.
		// { $Shell: { command: 'npx webpack-cli --config build/webpack.config.js' } },

	],

	new_version: [

		{ $ReadJsonFile: { filename: 'package.json', context: 'Package' } },

		// Prepare to finalize the existing version.
		{ $RunTask: { name: 'run_tests' } },
		{ $RunTask: { name: 'build_docs' } },
		{ $RunTask: { name: 'sync_version' } },
		{ $RunTask: { name: 'update_aws_docs' } },

		// Update github and finalize the version.
		{
			$Shell: {
				command: 'git add .',
				output: 'console', errors: 'console', halt_on_error: false
			}
		},
		{
			$Shell: {
				command: 'git commit -m "Finalization for v${Package.version}"',
				output: 'console', errors: 'console', halt_on_error: true
			}
		},
		{
			$Shell: {
				command: 'git push origin main',
				output: 'console', errors: 'console', halt_on_error: true
			}
		},
		// Tag the existing version
		{
			$Shell: {
				command: 'git tag -a v${Package.version} -m "Version v${Package.version}"',
				output: 'console', errors: 'console', halt_on_error: true
			}
		},
		{
			$Shell: {
				command: 'git push origin v${Package.version}',
				output: 'console', errors: 'console', halt_on_error: true
			}
		},

		// Update NPM with the new version.
		{ $RunTask: { name: 'npm_publish' } },

		// Increment and update the official package version.
		{ $SemverInc: { context: 'Package.version' } },
		{ $WriteJsonFile: { filename: 'package.json', context: 'Package' } },

		// Sync the version again.
		{ $RunTask: { name: 'sync_version' } },

		// Update github with the new version.
		{ $Shell: { command: 'git add .', errors: 'console', halt_on_error: true } },
		{ $Shell: { command: 'git commit -m "Initialization for v${Package.version}"', errors: 'console', halt_on_error: true } },
		{ $Shell: { command: 'git push origin main', errors: 'console', halt_on_error: true } },

	],

};