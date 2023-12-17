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


describe( '300) Context Tests', () =>
{


	//=====================================================================
	describe( '$LoadJsModule', () =>
	{

		//---------------------------------------------------------------------
		it( 'it loads a Javascript module into a Context field', async () => 
		{
			// Create the step.
			let step = {
				filename: 'test/data/test-module.js',
				out: { context: 'test_module' },
			};

			// Invoke the command.
			let context = {};
			let success = await devops.Commands.$LoadJsModule.Invoke( step, context );
			assert.ok( success );

			// Check output.
			assert.ok( context.test_module );
			assert.strictEqual( context.test_module.message, 'Hello World!' );

			return;
		} );

	} );


	//=====================================================================
	describe( '$PrintContext', () =>
	{

		//---------------------------------------------------------------------
		it( 'it prints the Context to a file', async () => 
		{
			// Create the step.
			let step = {
				context: 'message',
				out: { filename: 'test/~/message.txt' },
			};

			// Invoke the command.
			let context = { message: 'Hello World!' };
			let success = await devops.Commands.$PrintContext.Invoke( step, context );
			assert.ok( success );

			// Check output.
			assert.ok( LIB_FS.existsSync( step.out.filename ) );
			assert.strictEqual( LIB_FS.readFileSync( step.out.filename, 'utf8' ), 'Hello World!' );

			return;
		} );

	} );


	//=====================================================================
	describe( '$SemverInc', () =>
	{

		//---------------------------------------------------------------------
		it( 'it increments a semver version number', async () => 
		{
			// Create the step.
			let step = {
				context: 'semver',
			};

			// Invoke the command.
			let context = { semver: '1.2.3' };
			let success = await devops.Commands.$SemverInc.Invoke( step, context );
			assert.ok( success );

			// Check output.
			assert.ok( context.semver );
			assert.strictEqual( context.semver, '1.2.4' );

			return;
		} );

	} );


	//=====================================================================
	describe( '$SetContext', () =>
	{

		//---------------------------------------------------------------------
		it( 'it sets a field value in the Context', async () => 
		{
			// Create the step.
			let step = {
				context: 'test_field',
				value: 3.14,
			};

			// Invoke the command.
			let context = { test_field: null };
			let success = await devops.Commands.$SetContext.Invoke( step, context );
			assert.ok( success );

			// Check output.
			assert.ok( context.test_field );
			assert.strictEqual( context.test_field, 3.14 );

			return;
		} );

	} );


} );
