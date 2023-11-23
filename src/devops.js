#!/usr/bin/env node
'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const COMMAND_LINE = require( './Engine/CommandLine' )();
const DEVOPS = require( './Engine/DevOpsEngine' );

//---------------------------------------------------------------------
// Get Command Line arguments.
let Parameters = {
	package_folder: '',
	package_filename: '',
	package: null,
	tasks_filename: '',
	tasks: null,
	task_name: '',
};
let ProcessArgs = COMMAND_LINE.FromCommandLine();
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
// Find the package.json file.
function find_owning_package_filename( Path )
{
	let filename = LIB_PATH.join( Path, 'package.json' );
	if ( LIB_FS.existsSync( filename ) )
	{
		return filename;
	}
	else
	{
		Path = LIB_PATH.dirname( Path );
		if ( Path === '' ) { return null; }
		return find_owning_package_filename( Path );
	}
}
if ( !Parameters.package_filename ) { Parameters.package_filename = find_owning_package_filename( process.cwd() ); }
if ( !Parameters.package_filename )
{
	throw new Error( `Unable to find a package.json file.` );
}
Parameters.package = require( Parameters.package_filename );
Parameters.package_folder = LIB_PATH.dirname( Parameters.package_filename );

console.log( `@liquicode/devops is running in [${Parameters.package_folder}].` );

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
	// List the available tasks.
	if ( Parameters.task_name === '' )
	{
		console.log( `No task was specified. Here is a ist of available tasks:` );
		for ( let key in Parameters.tasks )
		{
			console.log( `\t${key}` );
		}
		return;
	}

	// Construct the DevOps settings.
	let settings = {
		CommandPath: null,
		PackageFolder: Parameters.package_folder,
		LogSettings: {
			Colors: true,
			Timestamps: false,
		},
	};
	if ( ProcessArgs.flags.nocolor ) { settings.LogSettings.Colors = false; }
	if ( ProcessArgs.flags.timestamps ) { settings.LogSettings.Timestamps = true; }

	// Execute the task.
	let devops = DEVOPS( settings, Parameters.tasks );
	let task_result = await devops.RunTask( Parameters.task_name );
	if ( task_result === false )
	{
		process.exit( 1 );
	}

	// Return, OK.
	process.exit( 0 );
} )();
