'use strict';

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		CommandName: '$RunTask',
		CommandHelp: `$RunTask:
Runs a task from the loaded configuration.
Fields:
- name: The name of the task to run.
- inherit_context: If true, runs the new task with the same context as this task.
`,


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.name === 'undefined' ) { throw new Error( `The "name" field is required.` ); }
			if ( typeof Step.name !== 'string' ) { throw new Error( `The "name" field must be a string.` ); }
			let name = Engine.ResolveString( Context, Step.name );
			let context = null;
			if ( Step.inherit_context )
			{
				context = Context;
			}
			let result = await Engine.RunTask( name, context );
			if ( result === false ) { return false; }
			return true;
		},


	};

	// Return the command.
	return Command;
};
