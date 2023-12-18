
# Example: Using EJS to Generate Documents

`devops` can be used to process documents containing embedded Javascript (ejs) code.

### File: my-tasks.js

The task file is a Javascript file which defines your tasks as data constructs.
This file is used by `devops` to run your tasks.

```js
module.exports = {

	Context: {
		// Load the project's package file into the Context.
		Package: require( 'package.json' ),
	},

	build_docs: [
		{
			$ExecuteEjs: {
				ejs_file: 'readme.ejs.md',
				out: { filename: 'readme.md' },
			}
		},
	],
};
```

### File: readme.ejs.md

```md
# <%- Context.Package.name %>

> Home: [<%- Context.Package.homepage %>](<%- Context.Package.homepage %>)
>
> Version: <%- Context.Package.version %>

My project's readme file.
```


### Running the Task

```shell
npx @liquicode/devops --tasks my-tasks.js build_docs
```


### Discussion

The task file contains a `Context` section which allows you to initialize the task context with specific values.
In this case, we are loading the contents of the `package.json` file in to the context field called `Package`.
We can then refer to package data in our ejs like `<%- Context.Package.version %>`.

This task file defines a single task called `build_docs` and contains an array of steps/commands.
Steps are executed in the order that they appear in the task.
If one step fails or generates an error, then `devops` will stop processing the task.
This task performs a single step which reads the template document `readme.ejs.md` executes the ejs code and
outputs the result to the file `readme.md`.

In order to execute this task, you give `devops` the task file and the name of the task to run.
Using the npm utility `npx` will run `devops` whether it is installed locally in your project or globally in your environment.
If not installed at all, `npx` will temporarily download and run the latest version of `devops`.


