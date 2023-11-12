'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_CHILD_PROCESS = require( 'child_process' );


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
// Load the configuration file.
let Config = null;
{
	function load_configuration( Path )
	{
		if ( LIB_FS.existsSync( Path ) ) 
		{
			console.log( `Load configuration from [${Path}].` );
			return require( Path );
		}
		return null;
	}
	Config = load_configuration( LIB_PATH.join( PackageFolder, 'ci-cd.config.json' ) );
	if ( Config === null ) { Config = load_configuration( LIB_PATH.join( PackageFolder, 'ci-cd.config.js' ) ); }
	if ( Config === null ) { Config = load_configuration( LIB_PATH.join( __dirname, 'ci-cd.config.json' ) ); }
	if ( Config === null ) { Config = load_configuration( LIB_PATH.join( __dirname, 'ci-cd.config.js' ) ); }
	if ( Config === null ) { throw new Error( `Unable to locate the configuration file.` ); }
}



//---------------------------------------------------------------------
function find_between( Text, StartText, EndText, CaseSensitive = true ) 
{
	if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
	if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
	if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
	if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
	if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }

	let work_text = Text;
	if ( !CaseSensitive ) 
	{
		work_text = work_text.toLowerCase();
		StartText = StartText.toLowerCase();
		EndText = EndText.toLowerCase();
	}

	// Find StartText
	let start_text_begin = 0;
	if ( StartText.length ) { start_text_begin = work_text.indexOf( StartText ); }
	if ( start_text_begin < 0 ) { return null; }

	// Find EndText
	let end_text_begin = work_text.length;
	if ( EndText.length ) { end_text_begin = work_text.indexOf( EndText, start_text_begin + StartText.length ); }
	if ( end_text_begin < 0 ) { return null; }

	let found_text = Text.substring( start_text_begin + StartText.length, end_text_begin );
	return found_text;
}


//---------------------------------------------------------------------
function replace_between( Text, StartText, EndText, WithText, CaseSensitive = true ) 
{
	if ( typeof Text !== 'string' ) { throw new Error( 'The parameter [Text] must be a string.' ); }
	if ( ( StartText === undefined ) || ( StartText === null ) ) { StartText = ''; }
	if ( typeof StartText !== 'string' ) { throw new Error( 'The parameter [StartText] must be a string or null.' ); }
	if ( ( EndText === undefined ) || ( EndText === null ) ) { EndText = ''; }
	if ( typeof EndText !== 'string' ) { throw new Error( 'The parameter [EndText] must be a string or null.' ); }
	if ( typeof WithText !== 'string' ) { throw new Error( 'The parameter [WithText] must be a string.' ); }

	let found_text = find_between( Text, StartText, EndText, CaseSensitive );
	if ( found_text !== null ) 
	{
		Text = Text.replace( `${StartText}${found_text}${EndText}`, `${StartText}${WithText}${EndText}` );
	}
	return Text;
}


//---------------------------------------------------------------------
function get_object_value( Document, Path )
{
	let path_elements = Path.split( '.' );
	let data = Document;
	for ( let index = 0; index < path_elements.length; index++ )
	{
		let name = path_elements[ index ];
		if ( name === '' ) { continue; }
		if ( typeof data !== 'object' ) { return; }
		data = data[ name ];
	}
	return data;
}


//---------------------------------------------------------------------
function set_object_value( Document, Path, Value )
{
	let path_elements = Path.split( '.' );
	let data = Document;
	for ( let index = 0; index < path_elements.length; index++ )
	{
		let name = path_elements[ index ];
		if ( name === '' ) { continue; }
		if ( typeof data !== 'object' ) { return false; }
		// if ( Array.isArray( data ) ) { return false; }
		if ( typeof data[ name ] === 'undefined' ) { data[ name ] = {}; }
		if ( index < ( path_elements.length - 1 ) )
		{
			data = data[ name ];
		}
		else
		{
			data[ name ] = Value;
		}
	}
	return true;
}


//---------------------------------------------------------------------
function resolve_string( Context, Text )
{
	if ( typeof Context !== 'object' ) { throw new Error( `resolve_string: The "Context" field must be an object.` ); }
	if ( typeof Text !== 'string' ) { throw new Error( `resolve_string: The "Text" field must be a string.` ); }

	if ( Text.startsWith( '${' ) && Text.endsWith( '}' ) )
	{
		let found_text = find_between( Text, '${', '}' );
		let value = get_object_value( Context, found_text );
		return value;
	}
	else
	{
		let found_text = find_between( Text, '${', '}' );
		if ( found_text !== null ) 
		{
			let value = get_object_value( Context, found_text );
			if ( typeof value === 'undefined' ) { value = ''; }
			if ( typeof value !== 'string' )
			{
				value = JSON.stringify( value );
			}
			Text = Text.replace( "${" + found_text + "}", value );
		}
		return Text;
	}
}


//---------------------------------------------------------------------
function resolve_path( Context, Path )
{
	Path = resolve_string( Context, Path );
	Path = LIB_PATH.join( PackageFolder, Path );
	return Path;
}



//---------------------------------------------------------------------
let Executor = {};

Executor.$Shell = async function ( Context, Step )
{
	if ( typeof Step.command === 'undefined' ) { throw new Error( `$Shell: The "command" field is required.` ); }

	let result = await new Promise(
		( resolve, reject ) =>
		{
			LIB_CHILD_PROCESS.exec( Step.command,
				( error, stdout, stderr ) =>
				{
					if ( error )
					{
						reject( error );
						return;
					}
					let output =
					{
						stdout: stdout,
						stderr: stderr,
					};
					// print_command_output( Command, output );
					resolve( output );
				} );
			return;
		} );
	if ( typeof Step.output !== 'undefined' )
	{
		if ( Step.output === 'console' )
		{
			console.log( result.stdout );
		}
		else
		{
			let filename = resolve_path( Context, Step.output );
			LIB_FS.writeFileSync( filename, result.stdout, 'utf8' );
		}
	}
	if ( typeof Step.errors !== 'undefined' )
	{
		if ( Step.errors === 'console' )
		{
			console.log( result.stderr );
		}
		else
		{
			let filename = resolve_path( Context, Step.errors );
			LIB_FS.writeFileSync( filename, result.stderr, 'utf8' );
		}
	}
	return true;
};

Executor.$EnsureFolder = async function ( Context, Step )
{
	if ( typeof Step.folder === 'undefined' ) { throw new Error( `$EnsureFolder: The "folder" field is required.` ); }
	let path = resolve_path( Context, Step.folder );
	if ( LIB_FS.existsSync( path ) === false )
	{
		LIB_FS.mkdirSync( path, { recursive: true } );
	}
	return true;
};

Executor.$ClearFolder = async function ( Context, Step )
{
	function r_ClearFolder( Context, Path )
	{
		if ( LIB_FS.existsSync( Path ) === false ) { return true; }
		let entries = LIB_FS.readdirSync( Path, { withFileTypes: true, recursive: false } );
		for ( let index = 0; index < entries.length; index++ )
		{
			let filename = LIB_PATH.join( Path, entries[ index ].name );
			if ( entries[ index ].isDirectory() === true )
			{
				let result = r_ClearFolder( Context, filename );
				if ( result === false ) { return false; }
				LIB_FS.rmdirSync( filename );
			}
			else
			{
				LIB_FS.unlinkSync( filename );
			}
		}
		return true;
	}
	if ( typeof Step.folder === 'undefined' ) { throw new Error( `$ClearFolder: The "folder" field is required.` ); }
	let path = resolve_path( Context, Step.folder );
	let result = r_ClearFolder( Context, path );
	return result;
};

Executor.$RemoveFolder = async function ( Context, Step )
{
	if ( typeof Step.folder === 'undefined' ) { throw new Error( `$RemoveFolder: The "folder" field is required.` ); }
	let path = resolve_path( Context, Step.folder );
	if ( LIB_FS.existsSync( path ) === false ) { return true; }
	LIB_FS.rmdirSync( path );
	return true;
};

Executor.$CopyFile = async function ( Context, Step )
{
	if ( typeof Step.from === 'undefined' ) { throw new Error( `$CopyFile: The "from" field is required.` ); }
	if ( typeof Step.to === 'undefined' ) { throw new Error( `$CopyFile: The "to" field is required.` ); }
	LIB_FS.copyFileSync( resolve_path( Context, Step.from ), resolve_path( Context, Step.to ) );
	return true;
};

Executor.$ReadTextFile = async function ( Context, Step )
{
	if ( typeof Step.filename === 'undefined' ) { throw new Error( `$ReadTextFile: The "filename" field is required.` ); }
	if ( typeof Step.context === 'undefined' ) { throw new Error( `$ReadTextFile: The "context" field is required.` ); }
	let filename = resolve_path( Context, Step.filename );
	let data = LIB_FS.readFileSync( filename, 'utf8' );
	let result = set_object_value( Context, Step.context, data );
	if ( result === false ) { return false; }
	return true;
};

Executor.$WriteTextFile = async function ( Context, Step )
{
	if ( typeof Step.filename === 'undefined' ) { throw new Error( `$WriteTextFile: The "filename" field is required.` ); }
	if ( typeof Step.value === 'undefined' ) { throw new Error( `$WriteTextFile: The "value" field is required.` ); }
	// Get the value.
	let value = Step.value;
	if ( typeof value === 'string' )
	{
		value = resolve_string( Context, value );
	}
	let filename = resolve_path( Context, Step.filename );
	LIB_FS.writeFileSync( filename, value, 'utf8' );
	return true;
};

Executor.$ReadJsonFile = async function ( Context, Step )
{
	if ( typeof Step.filename === 'undefined' ) { throw new Error( `$ReadJsonFile: The "filename" field is required.` ); }
	if ( typeof Step.context === 'undefined' ) { throw new Error( `$ReadJsonFile: The "context" field is required.` ); }
	let filename = resolve_path( Context, Step.filename );
	let data = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
	if ( typeof Step.field !== 'undefined' )
	{
		data = get_object_value( data, Step.field );
	}
	// Context[ Step.context ] = data;
	let result = set_object_value( Context, Step.context, data );
	if ( result === false ) { return false; }
	return true;
};

Executor.$WriteJsonFile = async function ( Context, Step )
{
	if ( typeof Step.filename === 'undefined' ) { throw new Error( `$WriteJsonFile: The "filename" field is required.` ); }
	if ( typeof Step.value === 'undefined' ) { throw new Error( `$WriteJsonFile: The "value" field is required.` ); }
	// Get the value.
	let value = Step.value;
	if ( typeof value === 'string' )
	{
		value = resolve_string( Context, value );
	}
	// Read the JSON.
	let filename = resolve_path( Context, Step.filename );
	let data = null;
	if ( typeof Step.field !== 'undefined' )
	{
		data = JSON.parse( LIB_FS.readFileSync( filename, 'utf8' ) );
		// data[ Step.field ] = value;
		let result = set_object_value( data, Step.field, value );
		if ( result === false ) { return false; }
	}
	else
	{
		data = value;
	}
	// Write the JSON.
	let json = null;
	if ( Step.friendly )
	{
		json = JSON.stringify( data, null, '\t' );
	}
	else
	{
		json = JSON.stringify( data );
	}
	LIB_FS.writeFileSync( filename, json, 'utf8' );
	return true;
};

Executor.$ReplaceFileText = async function ( Context, Step )
{
	if ( typeof Step.filename === 'undefined' ) { throw new Error( `$ReplaceFileText: The "filename" field is required.` ); }
	if ( typeof Step.value === 'undefined' ) { throw new Error( `$ReplaceFileText: The "value" field is required.` ); }
	// Get the value.
	let value = Step.value;
	if ( typeof value === 'string' )
	{
		value = resolve_string( Context, value );
	}
	// Read the file.
	let filename = resolve_path( Context, Step.filename );
	let text = LIB_FS.readFileSync( filename, 'utf8' );
	// Replace text.
	text = replace_between( text, Step.start_text, Step.end_text, value );
	// Write the file.
	LIB_FS.writeFileSync( filename, text, 'utf8' );
	return true;
};

Executor.$SemverInc = async function ( Context, Step )
{
	if ( typeof Step.context === 'undefined' ) { throw new Error( `$SemverInc: The "context" field is required.` ); }
	if ( typeof Step.context !== 'string' ) { throw new Error( `$SemverInc: The "context" field must be a string.` ); }
	if ( !Step.context.startsWith( '${' ) || !Step.context.endsWith( '}' ) ) { throw new Error( `$SemverInc: The "value" field must be context variable (e.g. "\${field}").` ); }
	let field_name = find_between( Step.context, '${', '}' );
	let value = get_object_value( Context, field_name );
	if ( typeof value !== 'string' ) { throw new Error( `$SemverInc: The "context" field must point to semver formatted version number.` ); }
	let parts = value.split( '.' );
	if ( parts.length === 0 ) { throw new Error( `$SemverInc: The "context" field must point to semver formatted version number.` ); }
	let n = Number( parts[ parts.length - 1 ] );
	if ( isNaN( n ) ) { throw new Error( `$SemverInc: The "context" field must point to semver formatted version number.` ); }
	n++;
	parts[ parts.length - 1 ] = `${n}`;
	value = parts.join( '.' );
	let result = set_object_value( Context, field_name, value );
	if ( result === false ) { return false; }
	return true;
};

Executor.$RunTask = async function ( Context, Step )
{
	if ( typeof Step.name === 'undefined' ) { throw new Error( `$RunTask: The "name" field is required.` ); }
	if ( typeof Step.name !== 'string' ) { throw new Error( `$RunTask: The "name" field must be a string.` ); }
	let name = resolve_string( Context, Step.name );
	let context = null;
	if ( Step.inherit_context )
	{
		context = Context;
	}
	let result = await RunTask( name, context );
	if ( result === false ) { return false; }
	return true;
};


//---------------------------------------------------------------------
async function RunTask( TaskName, Context )
{
	console.log( `Running task [${TaskName}].` );
	// Load the task.
	let task = Config[ TaskName ];
	if ( typeof task === 'undefined' ) { throw new Error( `The task [${task}] does not exist.` ); }

	// Execute the task steps.
	let context = {};
	if ( ( typeof Context === 'object' ) && ( Context !== null ) && !Array.isArray( Context ) )
	{
		context = Context;
	}
	for ( let index = 0; index < task.length; index++ )
	{
		let step = task[ index ];
		let step_result = null;
		for ( let command_name in Executor )
		{
			if ( typeof step[ command_name ] !== 'undefined' )
			{
				let command = Executor[ command_name ];
				console.log( `Running step [${command_name}].` );
				step_result = await command( context, step[ command_name ] );
				break;
			}
		}
		if ( step_result === null )
		{
			console.log( `Could not find the command in step: [${JSON.stringify( step )}]` );
			return false;
		}
	}
	return true;
}


//---------------------------------------------------------------------
// Get Command Line arguments.
let Options = {
	task: '',
};
if ( process.argv.length >= 3 )
{
	Options.task = process.argv[ 2 ];
}


//---------------------------------------------------------------------
// Process the configuration.
( async () =>
{

	// List the available tasks.
	if ( Options.task === '' )
	{
		console.log( `No task was specified. Here is a ist of available tasks:` );
		for ( let key in Config )
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
