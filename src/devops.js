#!/usr/bin/env node
'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const COMMAND_LINE = require( './Engine/CommandLine' )();
const DEVOPS = require( './Engine/DevOpsEngine' );
const HELP = require( './Engine/Help' );

//---------------------------------------------------------------------
// Get Command Line arguments.
let Parameters = {
	execution_folder: process.cwd(),
	package_folder: '',
	package_filename: '',
	package: null,
	tasks_filename: '',
	tasks: null,
	task_name: '',
};
let ProcessArgs = COMMAND_LINE.FromCommandLine();
// Help
let help_mode = false;
if ( ProcessArgs.flags.help || ProcessArgs.flags.h ) { help_mode = true; }
// package_filename
if ( !Parameters.package_filename && ProcessArgs.package_filename ) { Parameters.package_filename = ProcessArgs.package_filename; }
if ( !Parameters.package_filename && ProcessArgs.package ) { Parameters.package_filename = ProcessArgs.package; }
if ( !Parameters.package_filename && ProcessArgs.p ) { Parameters.package_filename = ProcessArgs.p; }
// tasks_filename
if ( !Parameters.tasks_filename && ProcessArgs.tasks_filename ) { Parameters.tasks_filename = ProcessArgs.tasks_filename; }
if ( !Parameters.tasks_filename && ProcessArgs.tasks ) { Parameters.tasks_filename = ProcessArgs.tasks; }
if ( !Parameters.tasks_filename && ProcessArgs.t ) { Parameters.tasks_filename = ProcessArgs.t; }
// task_name
if ( !Parameters.task_name && ProcessArgs.task ) { Parameters.task_name = ProcessArgs.task; }
if ( !Parameters.task_name && ProcessArgs.positional.length )
{
	Parameters.task_name = ProcessArgs.positional[ 0 ];
}


//---------------------------------------------------------------------
// Check for the package.json file.
if ( Parameters.package_filename ) 
{
	Parameters.package = require( Parameters.package_filename );
	Parameters.package_folder = LIB_PATH.dirname( Parameters.package_filename );
	Parameters.execution_folder = Parameters.package_folder;
}


//---------------------------------------------------------------------
// Run startup.
console.log( `@liquicode/devops is running in [${Parameters.execution_folder}].` );


//---------------------------------------------------------------------
// Handle Help requests.
if ( ProcessArgs.flags.help || ProcessArgs.flags.h )
{

	// Construct the DevOps settings.
	let settings = {
		LogSettings: {
			Colors: true,
			Timestamps: false,
		},
	};
	if ( ProcessArgs.flags.nocolor ) { settings.LogSettings.Colors = false; }
	if ( ProcessArgs.flags.timestamps ) { settings.LogSettings.Timestamps = true; }

	// Create the devops.
	let devops = DEVOPS.NewDevops( settings, {} );

	// Show the help.
	if ( ProcessArgs.flags.help && ProcessArgs.help )
	{
		HELP.PrintCommandDetail( devops, ProcessArgs.help );
	}
	else if ( ProcessArgs.flags.h && ProcessArgs.h )
	{
		HELP.PrintCommandDetail( devops, ProcessArgs.h );
	}
	else
	{
		HELP.PrintCommandList( devops );
	}

	// Return, OK.
	process.exit( 0 );
}


//---------------------------------------------------------------------
// Load the tasks file.
function locate_tasks_file( Path )
{
	let filename = LIB_PATH.join( Path, 'devops.tasks.json' );
	if ( LIB_FS.existsSync( filename ) ) { return filename; }
	filename = LIB_PATH.join( Path, 'devops.tasks.js' );
	if ( LIB_FS.existsSync( filename ) ) { return filename; }
	return null;
}
if ( !Parameters.tasks_filename ) { Parameters.tasks_filename = locate_tasks_file( process.cwd() ); }
if ( !Parameters.tasks_filename ) { Parameters.tasks_filename = locate_tasks_file( Parameters.package_folder ); }
if ( !Parameters.tasks_filename )
{
	throw new Error( `Unable to find a devops.tasks.json file.` );
}
Parameters.tasks_filename = LIB_PATH.resolve( Parameters.tasks_filename );
if ( !LIB_FS.existsSync( Parameters.tasks_filename ) )
{
	throw new Error( `Unable to find the file [${Parameters.tasks_filename}].` );
}
Parameters.tasks = require( Parameters.tasks_filename );


//---------------------------------------------------------------------
// Process the configuration.
( async () =>
{
	// Construct the DevOps settings.
	let settings = {
		CommandPath: null,
		ExecutionFolder: Parameters.execution_folder,
		LogSettings: {
			Colors: true,
			Timestamps: false,
		},
	};
	if ( ProcessArgs.flags.nocolor ) { settings.LogSettings.Colors = false; }
	if ( ProcessArgs.flags.timestamps ) { settings.LogSettings.Timestamps = true; }

	// Show help.
	if ( help_mode )
	{
		let devops = DEVOPS.NewDevops( settings );
		ShowHelp( devops, Parameters.task_name );
		process.exit( 0 );
	}

	if ( Parameters.task_name === '' )
	{
		Parameters.task_name = 'default';
	}

	// Check to inject the Context package field.
	if ( Parameters.package )
	{
		if ( !Parameters.tasks.Context ) { Parameters.tasks.Context = {}; }
		Parameters.tasks.Context.package = Parameters.package;
	}

	// Execute the task.
	let devops = DEVOPS.NewDevops( settings, Parameters.tasks );
	let task_result = await devops.RunTask( Parameters.task_name );
	if ( task_result === false )
	{
		process.exit( 1 );
	}

	// Return, OK.
	process.exit( 0 );
} )();
