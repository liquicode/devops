'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
module.exports = function ( EngineSettings, Tasks )
{
	if ( typeof EngineSettings.CommandPath === 'undefined' ) { EngineSettings.CommandPath = null; }
	if ( typeof EngineSettings.Colors === 'undefined' ) { EngineSettings.Colors = true; }


	//---------------------------------------------------------------------
	// Construct the engine.
	let Engine = {};
	Engine.Settings = EngineSettings;
	Engine.Log = require( './Log' );
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
		if ( typeof Context !== 'object' ) { throw new Error( `resolve_string: The "Context" field must be an object.` ); }
		if ( typeof Text !== 'string' ) { throw new Error( `resolve_string: The "Text" field must be a string.` ); }

		if ( Text.startsWith( '${' ) && Text.endsWith( '}' ) )
		{
			let found_text = Engine.Loose.FindBetween( Text, '${', '}' );
			let value = Engine.Loose.GetObjectValue( Context, found_text );
			return value;
		}
		else
		{
			let found_text = Engine.Loose.FindBetween( Text, '${', '}' );
			if ( found_text !== null ) 
			{
				let value = Engine.Loose.GetObjectValue( Context, found_text );
				if ( typeof value === 'undefined' ) { value = ''; }
				if ( typeof value !== 'string' )
				{
					value = JSON.stringify( value );
				}
				Text = Text.replace( "${" + found_text + "}", value );
			}
			return Text;
		}
	};


	//---------------------------------------------------------------------
	Engine.ResolvePath = function ( Context, Path )
	{
		Path = Engine.ResolveString( Context, Path );
		Path = LIB_PATH.join( PackageFolder, Path );
		return Path;
	};


	//---------------------------------------------------------------------
	Engine.RunTask = async function ( TaskName, Context )
	{
		Engine.Log.Print( `Running task [${TaskName}].` );

		// Load the task.
		let task = Engine.Tasks[ TaskName ];
		if ( typeof task === 'undefined' ) { throw new Error( `The task [${TaskName}] does not exist.` ); }
		if ( !Array.isArray( task ) ) { throw new Error( `The task [${TaskName}] must be an array of steps.` ); }

		// Prepare the execution context.
		let context = {};
		if ( ( typeof Context === 'object' ) && ( Context !== null ) && !Array.isArray( Context ) )
		{
			context = Context;
		}

		// Execute the task commands.
		for ( let index = 0; index < task.length; index++ )
		{
			let step = task[ index ];
			Engine.Log.Print( `Invoking [${step.CommandName}].` );
			try
			{
				let result = await step.Invoke( step, context );
				if ( result === false )
				{
					Engine.Log.Print( `The step [${step.CommandName}] returned false and halted execution of task [${TaskName}].` );
					return false;
				}
			}
			catch ( error )
			{
				Engine.Log.Print( `${step.CommandName} threw an error:` );
				Engine.Log.Print( error );
				return false;
			}
		}

		// Return, OK.
		return true;
	};


	//---------------------------------------------------------------------
	// Load the standard commands.
	Engine.LoadCommands( LIB_PATH.join( __dirname, 'Commands' ), true );
	// Load the user commands.
	if ( Engine.Settings.CommandPath )
	{
		Engine.LoadCommands( Engine.Settings.CommandPath, true );
	}


	//---------------------------------------------------------------------
	// Return the engine.
	return Engine;
};
