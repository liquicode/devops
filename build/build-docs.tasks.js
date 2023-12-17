'use strict';

module.exports = {

	Context: {},

	default: [

		// Generate: readme.md
		{
			$ExecuteEjs: {
				ejs_file: 'docs/templates/readme.md',
				use_eval: true,
				// debug_script: { filename: 'docs/templates/readme.md.script.js' },
				out: { filename: 'docs/external/readme.md' },
			}
		},
		{ $CopyFile: { from: 'docs/external/readme.md', to: 'readme.md' } },

		// Generate: version.md
		{
			$ExecuteEjs: {
				ejs_string: '<%-Engine.Library.version%>',
				use_eval: true,
				// debug_script: { filename: 'docs/templates/readme.md.script.js' },
				out: { filename: 'docs/external/version.md' },
			}
		},
		{ $CopyFile: { from: 'docs/external/version.md', to: 'version.md' } },

	],

};