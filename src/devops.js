'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
// Find the package.json file.
let PackageFolder = __dirname;
let Package = null;
while ( true )
{
	let filename = LIB_PATH.join( PackageFolder, 'package.json' );
	if ( LIB_FS.existsSync( filename ) )
	{
		Package = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
		console.log( `Loaded package.json from [${PackageFolder}]: ${Package.name}, v${Package.version}` );
		break;
	}
	PackageFolder = LIB_PATH.dirname( PackageFolder );
	if ( PackageFolder === '' ) { throw new Error( `A package.json file was not found.` ); }
}


//---------------------------------------------------------------------
// Get Command Line arguments.
let TasksFilename = null;
let TaskName = null;
let Options = {
	task: '',
};
if ( process.argv.length >= 3 )
{
	Options.task = process.argv[ 2 ];
}


//---------------------------------------------------------------------
// Load the tasks file.
let Tasks = null;
{
	function load_tasks( Path )
	{
		if ( LIB_FS.existsSync( Path ) ) 
		{
			console.log( `Loading tasks from [${Path}].` );
			return require( Path );
		}
		return null;
	}
	Tasks = load_tasks( LIB_PATH.join( PackageFolder, 'devops.config.json' ) );
	if ( Tasks === null ) { Tasks = load_tasks( LIB_PATH.join( PackageFolder, 'devops.config.js' ) ); }
	if ( Tasks === null ) { Tasks = load_tasks( LIB_PATH.join( __dirname, 'devops.config.json' ) ); }
	if ( Tasks === null ) { Tasks = load_tasks( LIB_PATH.join( __dirname, 'devops.config.js' ) ); }
	if ( Tasks === null ) { throw new Error( `Unable to locate the tasks file.` ); }
}


//---------------------------------------------------------------------
// Process the configuration.
( async () =>
{
	const DEVOPS = require( './DevOpsEngine' )();

	// List the available tasks.
	if ( Options.task === '' )
	{
		console.log( `No task was specified. Here is a ist of available tasks:` );
		for ( let key in Tasks )
		{
			console.log( `\t${key}` );
		}
		return;
	}

	// Execute the task.
	let task_result = await RunTask( Options.task );
	console.log( `Task result = [${task_result}].` );

	console.log( `Done.` );
	process.exit( 0 );
} )();
