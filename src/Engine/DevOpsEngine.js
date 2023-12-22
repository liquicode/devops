'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const ShellColors = require( './ShellColors' )();


module.exports = NewDevops();


//---------------------------------------------------------------------
function NewDevops( EngineSettings = {}, Tasks = {} )
{
	if ( typeof EngineSettings.ExecutionFolder === 'undefined' ) { EngineSettings.ExecutionFolder = process.cwd(); }
	// if ( typeof EngineSettings.PackageFolder === 'undefined' ) { throw new Error( `devops: The "Settings.PackageFolder" field must exist.` ); }
	if ( typeof EngineSettings.CommandPath === 'undefined' ) { EngineSettings.CommandPath = null; }
	if ( typeof EngineSettings.LogSettings === 'undefined' ) { EngineSettings.LogSettings = {}; }
	if ( typeof EngineSettings.VariableDelimiters === 'undefined' ) { EngineSettings.VariableDelimiters = [ '${', '}' ]; }
	if ( !Array.isArray( EngineSettings.VariableDelimiters ) ) { EngineSettings.VariableDelimiters = [ '${', '}' ]; }
	if ( EngineSettings.VariableDelimiters.length === 0 ) { EngineSettings.VariableDelimiters = [ '${', '}' ]; }
	if ( EngineSettings.VariableDelimiters.length === 1 ) { EngineSettings.VariableDelimiters.push( EngineSettings.VariableDelimiters[ 0 ] ); }
	if ( typeof EngineSettings.CommandsCaseSensitive === 'undefined' ) { EngineSettings.CommandsCaseSensitive = false; }


	//---------------------------------------------------------------------
	// Construct the engine.
	let Engine = {};
	Engine.Settings = EngineSettings;
	Engine.Log = require( './Log' )( EngineSettings.LogSettings );
	Engine.Loose = require( './Loose' );
	Engine.jsongin = require( '@liquicode/jsongin' );
	Engine.Commands = {};
	Engine.Tasks = Tasks;


	//---------------------------------------------------------------------
	// Factory Method
	Engine.NewDevops = NewDevops;


	//---------------------------------------------------------------------
	// Library Info
	let _package = require( '../../package.json' );
	Engine.Library = {
		name: _package.name,
		url: _package.homepage,
		version: _package.version,
	};


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
					if ( typeof command.Meta === 'undefined' ) { continue; }
					if ( typeof command.Invoke !== 'function' ) { continue; }
					let command_key = command.Meta.CommandName;
					if ( !Engine.Settings.CommandsCaseSensitive ) { command_key = command_key.toLowerCase(); }
					Engine.Commands[ command_key ] = command;
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
			let value = Engine.jsongin.GetValue( Context, name );
			if ( typeof value === 'undefined' ) { value = ''; }
			if ( typeof value !== 'string' ) { value = JSON.stringify( value ); }
			Text = Text.replace(
				`${EngineSettings.VariableDelimiters[ 0 ]}${name}${EngineSettings.VariableDelimiters[ 1 ]}`,
				value );
		}
		return Text;
	};


	//---------------------------------------------------------------------
	Engine.ResolvePath = function ( Context, Path )
	{
		Path = Engine.ResolveString( Context, Path );
		Path = LIB_PATH.resolve( Engine.Settings.ExecutionFolder, Path );
		return Path;
	};


	//---------------------------------------------------------------------
	Engine.SendOutput = function ( Context, Outspec, Output )
	{
		if ( Outspec && Output )
		{
			let value = Output;
			if ( Outspec.as === 'string' )
			{
				value = ( '' + value );
			}
			else if ( Outspec.as === 'json' )
			{
				value = JSON.stringify( value );
			}
			else if ( Outspec.as === 'json-friendly' )
			{
				value = JSON.stringify( value, null, '    ' );
			}
			if ( Outspec.log )
			{
				Engine.Log.Print( Engine.Loose.FormatConsoleOutput( 'Output', value ) );
			}
			if ( Outspec.console )
			{
				console.log( Engine.Loose.FormatConsoleOutput( 'Output', value ) );
			}
			if ( Outspec.filename )
			{
				let filename = Engine.ResolvePath( Context, Outspec.filename );
				let path = LIB_PATH.dirname( filename );
				if ( !LIB_FS.existsSync( path ) )
				{
					LIB_FS.mkdirSync( path, { recursive: true } );
				}
				LIB_FS.writeFileSync( filename, value, 'utf8' );
			}
			if ( Outspec.context )
			{
				Engine.jsongin.SetValue( Context, Outspec.context, value );
			}
		}
		return;
	};


	//---------------------------------------------------------------------
	Engine.SendErrors = function ( Context, Errspec, Errors )
	{
		if ( Errspec && Errors )
		{
			if ( Errspec.log )
			{
				Engine.Log.Error( Engine.Loose.FormatConsoleOutput( 'Errors', Errors ) );
			}
			if ( Errspec.console )
			{
				console.error( Engine.Loose.FormatConsoleOutput( 'Errors', Errors ) );
			}
			if ( Errspec.filename )
			{
				let filename = Engine.ResolvePath( Context, Errspec.filename );
				LIB_FS.writeFileSync( filename, Errors, 'utf8' );
			}
			if ( Errspec.context )
			{
				Engine.jsongin.SetValue( Context, Errspec.context, Errors );
			}
		}
		return;
	};


	//---------------------------------------------------------------------
	Engine.ValidateStep = function ( Command, Step )
	{
		// Validate fields.
		for ( let index = 0; index < Command.Meta.CommandFields.length; index++ )
		{
			let field = Command.Meta.CommandFields[ index ];
			let field_name = `${Command.Meta.CommandName}.${field.name}`;
			let value = Engine.jsongin.GetValue( Step, field_name );
			let st = Engine.jsongin.ShortType( value );
			if ( st === 'u' )
			{
				if ( typeof field.default === 'undefined' )
				{
					throw new Error( `The field [${field_name}] is required.` );
				}
				else
				{
					Engine.jsongin.SetValue( Step, field_name, field.default );
				}
			}
			else if ( field.type === '' )
			{
				// Field is any type.
			}
			else if ( field.type.includes( st ) )
			{
				// Matches field type.
			}
			else
			{
				// Doesn't match field type.
				throw new Error( `The field [${field_name}] requires a type [${field.type}] value, but type [${st}] was given instead.` );
			}
		}
	};


	//---------------------------------------------------------------------
	Engine.RunSteps = async function ( TaskName, Steps, Context )
	{
		for ( let index = 0; index < Steps.length; index++ )
		{
			let step = Steps[ index ];
			let keys = Object.keys( step );
			if ( keys.length !== 1 ) { throw new Error( `RunSteps: Each task step must have one, and only one, command.` ); }
			let command_key = keys[ 0 ];
			let command = null;
			if ( Engine.Settings.CommandsCaseSensitive ) 
			{
				command = Engine.Commands[ command_key ];
			}
			else
			{
				command = Engine.Commands[ command_key.toLowerCase() ];
			}
			if ( typeof command === 'undefined' ) { throw new Error( `RunSteps: The command [${command_key}] does not exist.` ); }
			Engine.Log.Heading( `Step: ${command.Meta.CommandName}` );
			Engine.Log.Indent();
			try
			{
				Engine.Log.Indent();
				Engine.Log.Muted( `${ShellColors.BoxChars.VertRight} ${JSON.stringify( step )}` );
				let step_t0 = new Date();
				Engine.ValidateStep( command, step );
				let result = await command.Invoke( step[ command_key ], Context );
				let step_t1 = new Date();
				if ( result === true )
				{
					Engine.Log.Muted( `${ShellColors.BoxChars.BottomLeft} Step Completed: ${command.Meta.CommandName} OK, ${step_t1 - step_t0} ms.` );
				}
				else
				{
					Engine.Log.Error( `RunSteps: The [${command.Meta.CommandName}] command returned false and halted execution of the task [${TaskName}].` );
				}
				Engine.Log.Unindent();
				if ( result === false ) { return false; }

			}
			catch ( error )
			{
				Engine.Log.Error( `RunSteps: ${command.Meta.CommandName} threw an error: ${error.message}` );
				return false;
			}
			finally
			{
				Engine.Log.Unindent();
			}
		}
		return true;
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
			process.chdir( Engine.Settings.ExecutionFolder );

			// Execute the task commands.
			Engine.Log.Heading( `Task: ${TaskName}` );
			Engine.Log.Indent();
			let task_t0 = new Date();
			let result = await Engine.RunSteps( TaskName, steps, context );
			if ( result === false ) { return false; }
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
