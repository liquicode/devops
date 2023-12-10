'use strict';

module.exports = {

	Context: {
		template_path: 'docs/template',
		output_path: 'docs/release',
	},

	Storages: {
		QueryOperators: {
			Adapter: 'jsonstor-excel',
			Settings: { Path: '../docs/data/Tables.xls', SheetName: 'Query Operators' },
		},
	},

	build_index: [
		{
			$StorageQuery: {
				Storage: QueryOperators,
				Query: { Supported: 'Yes' },
				EachRow: [
					{
						$ProcessDoc: {
							Template: '${template_path}/test.md',
							Ouput: '${output_path}/${Row.Operator}.md',
							StartEscape: '@{',
							EnedEscape: '}@',
						}
					},
				],
			},
		},
	],

};
