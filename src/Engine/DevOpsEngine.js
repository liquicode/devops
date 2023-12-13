'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
module.exports = function ( EngineSettings, Tasks )
{
	if ( typeof EngineSettings.PackageFolder === 'undefined' ) { throw new Error( `devops: The "Settings.PackageFolder" field must exist.` ); }
	if ( typeof EngineSettings.CommandPath === 'undefined' ) { EngineSettings.CommandPath = null; }
	if ( typeof EngineSettings.LogSettings === 'undefined' ) { EngineSettings.LogSettings = {}; }
	if ( typeof EngineSettings.VariableDelimiters === 'undefined' ) { EngineSettings.VariableDelimiters = [ '${', '}' ]; }
	if ( !Array.isArray( EngineSettings.VariableDelimiters ) ) { EngineSettings.VariableDelimiters = [ '${', '}' ]; }
	if ( EngineSettings.VariableDelimiters.length === 0 ) { EngineSettings.VariableDelimiters = [ '${', '}' ]; }
	if ( EngineSettings.VariableDelimiters.length === 1 ) { EngineSettings.VariableDelimiters.push( EngineSettings.VariableDelimiters[ 0 ] ); }


	//---------------------------------------------------------------------
	// Construct the engine.
	let Engine = {};
	Engine.Settings = EngineSettings;
	Engine.Log = require( './Log' )( EngineSettings.LogSettings );
	Engine.Loose = require( './Loose' );
	Engine.Commands = {};
	Engine.Tasks = Tasks;


	//---------------------------------------------------------------------
	Engine.LoadCommands = function ( Path, Recurse )
	{
		if ( LIB_FS.existsSync( Path ) === false ) { return false; }
		let entries = LIB_FS.readdirSync( Path, { withFileTypes: true, recursive: true } );
		for ( let index = 0; index < entries.length; index++ )
		{
			if ( entries[ index ].name.startsWith( '~' ) ) { continue; }
			if ( entries[ index ].name.startsWith( '_' ) ) { continue; }
			let path = LIB_PATH.join( Path, entries[ index ].name );
			if ( Recurse && ( entries[ index ].isDirectory() === true ) )
			{
				let result = Engine.LoadCommands( path, Recurse );
				if ( result === false ) { return false; }
			}
			else
			{
				try
				{
					let command = require( path )( Engine );
					if ( typeof command !== 'object' ) { continue; }
					if ( typeof command.CommandName === 'undefined' ) { continue; }
					if ( typeof command.Invoke !== 'function' ) { continue; }
					Engine.Commands[ command.CommandName ] = command;
				}
				catch ( error )
				{
					console.error( error );
				}
			}
		}
		return true;
	};


	//---------------------------------------------------------------------
	Engine.ResolveString = function ( Context, Text )
	{
		if ( typeof Context !== 'object' ) { throw new Error( `ResolveString: The "Context" field must be an object.` ); }
		if ( typeof Text !== 'string' ) { throw new Error( `ResolveString: The "Text" field must be a string.` ); }

		let items = Engine.Loose.FindAllBetween( Text, EngineSettings.VariableDelimiters[ 0 ], EngineSettings.VariableDelimiters[ 1 ] );
		for ( let index = 0; index < items.length; index++ )
		{
			let name = items[ index ];
			let value = Engine.Loose.GetObjectValue( Context, name );
			if ( typeof value === 'undefined' ) { value = ''; }
			if ( typeof value !== 'string' ) { value = JSON.stringify( value ); }
			Text = Text.replace(
				`${EngineSettings.VariableDelimiters[ 0 ]}${name}${EngineSettings.VariableDelimiters[ 1 ]}`,
				value );
		}
		return Text;

		// if ( Text.startsWith( '${' ) && Text.endsWith( '}' ) )
		// {
		// 	let found_text = Engine.Loose.FindBetween( Text, '${', '}' );
		// 	let value = Engine.Loose.GetObjectValue( Context, found_text );
		// 	return value;
		// }
		// else
		// {
		// 	let found_text = Engine.Loose.FindBetween( Text, '${', '}' );
		// 	if ( found_text !== null ) 
		// 	{
		// 		let value = Engine.Loose.GetObjectValue( Context, found_text );
		// 		if ( typeof value === 'undefined' ) { value = ''; }
		// 		if ( typeof value !== 'string' )
		// 		{
		// 			value = JSON.stringify( value );
		// 		}
		// 		Text = Text.replace( "${" + found_text + "}", value );
		// 	}
		// 	return Text;
		// }
	};


	//---------------------------------------------------------------------
	Engine.ResolvePath = function ( Context, Path )
	{
		Path = Engine.ResolveString( Context, Path );
		Path = LIB_PATH.join( Engine.Settings.PackageFolder, Path );
		return Path;
	};


	//---------------------------------------------------------------------
	Engine.RunTask = async function ( TaskName, Context )
	{
		// Load the task.
		let steps = Engine.Tasks[ TaskName ];
		if ( typeof steps === 'undefined' ) { throw new Error( `RunTask: The task [${TaskName}] does not exist.` ); }
		if ( !Array.isArray( steps ) ) { throw new Error( `RunTask: The task [${TaskName}] must be an array of steps.` ); }

		// Prepare the execution context.
		let context = {};
		if ( ( typeof Context === 'object' ) && ( Context !== null ) && !Array.isArray( Context ) )
		{
			// Use the supplied context.
			context = Context;
		}
		else if ( typeof Engine.Tasks.Context !== 'undefined' )
		{
			// Use the task file's context.
			context = JSON.parse( JSON.stringify( Engine.Tasks.Context ) );
		}

		// Get the current working directory.
		let previous_working_directory = process.cwd();

		try
		{
			process.chdir( Engine.Settings.PackageFolder );

			// Execute the task commands.
			Engine.Log.Heading( `Task: ${TaskName}` );
			Engine.Log.Indent();
			let task_t0 = new Date();
			for ( let index = 0; index < steps.length; index++ )
			{
				let step = steps[ index ];
				let keys = Object.keys( step );
				if ( keys.length !== 1 ) { throw new Error( `RunTask: Each task step must have one, and only one, command.` ); }
				let command_name = keys[ 0 ];
				let command = Engine.Commands[ command_name ];
				if ( typeof command === 'undefined' ) { throw new Error( `RunTask: The command [${command_name}] does not exist.` ); }
				Engine.Log.Heading( `Step: ${command_name}` );
				Engine.Log.Indent();
				try
				{
					Engine.Log.Indent();
					Engine.Log.Muted( JSON.stringify( step ) );
					let step_t0 = new Date();
					let result = await command.Invoke( step[ command_name ], context );
					let step_t1 = new Date();
					if ( result === true )
					{
						Engine.Log.Muted( `Step Completed: ${command_name} OK, ${step_t1 - step_t0} ms.` );
					}
					else
					{
						Engine.Log.Error( `RunTask: The [${command_name}] command returned false and halted execution of the task [${TaskName}].` );
					}
					Engine.Log.Unindent();
					if ( result === false ) { return false; }

				}
				catch ( error )
				{
					Engine.Log.Error( `RunTask: ${command_name} threw an error: ${error.message}` );
					return false;
				}
				finally
				{
					Engine.Log.Unindent();
				}
			}
			Engine.Log.Unindent();
			let task_t1 = new Date();
			Engine.Log.Muted( `Task Completed: ${TaskName} OK, ${task_t1 - task_t0} ms.` );

			// Return, OK.
			return true;

		}
		catch ( error )
		{
			Engine.Log.Error( `${error.message}` );
		}
		finally
		{
			process.chdir( previous_working_directory );
		}

	};


	//---------------------------------------------------------------------
	// Load the standard commands.
	Engine.LoadCommands( LIB_PATH.join( __dirname, '../Commands' ), true );
	// Load the user commands.
	if ( Engine.Settings.CommandPath )
	{
		Engine.LoadCommands( Engine.Settings.CommandPath, true );
	}


	//---------------------------------------------------------------------
	// Return the engine.
	return Engine;
};
