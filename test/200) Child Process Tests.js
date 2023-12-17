'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const TEMP_FOLDER = LIB_PATH.join( __dirname, '~' );
LIB_FS.rmdirSync( TEMP_FOLDER, { recursive: true, force: true } );
LIB_FS.mkdirSync( TEMP_FOLDER, { recursive: true } );

const assert = require( 'assert' );
const devops = require( '../src/Engine/DevOpsEngine' )
	.NewDevops( {
		ExecutionFolder: LIB_PATH.resolve( __dirname, '..' ),
		CommandsCaseSensitive: true, // because we are explicitly invoking the commands
	}, {} );


describe( '200) Child Process Tests', () =>
{


	//=====================================================================
	describe( '$Shell', () =>
	{

		//---------------------------------------------------------------------
		it( 'it runs a simple shell command and captures the output', async () => 
		{
			// Create the step.
			let step = {
				command: 'node --version',
				out: {
					console: false,
					filename: LIB_PATH.join( TEMP_FOLDER, 'node_version.out' ),
					context: 'node_version',
				},
				err: {
					console: false,
					filename: LIB_PATH.join( TEMP_FOLDER, 'node_version.err' ),
					context: 'errors',
				},
			};

			// Invoke the command.
			let context = {};
			let success = await devops.Commands.$Shell.Invoke( step, context );
			assert.ok( success );

			// Check output.
			assert.ok( context.node_version );
			assert.ok( context.node_version.startsWith( 'v' ) );
			assert.ok( LIB_FS.existsSync( step.out.filename ) );

			// Check errors.
			assert.ok( !context.errors );
			assert.ok( !LIB_FS.existsSync( step.err.filename ) );

			return;
		} );

	} );


} );
