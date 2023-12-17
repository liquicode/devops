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


describe( '600) Internet Tests', () =>
{


	//=====================================================================
	describe( '$GetResource', () =>
	{

		//---------------------------------------------------------------------
		it( 'should download an html file', async () => 
		{
			let step = {
				url: 'https://www.google.com/search?q=Test',
				as: 'string',
				out: {
					filename: LIB_PATH.join( TEMP_FOLDER, 'resource.txt' ),
					context: 'resource',
				},
			};
			let context = {};
			let success = await devops.Commands.$GetResource.Invoke( step, context );
			assert.ok( success );

			assert.ok( context.resource );
			assert.ok( context.resource.startsWith( "<!doctype html>" ) );
			assert.ok( context.resource.endsWith( "</html>" ) );

		} );

		//---------------------------------------------------------------------
		it( 'should make an API call', async () => 
		{
			let step = {
				url: 'https://httpbin.org/get',
				as: 'json',
				out: {
					// filename: LIB_PATH.join( TEMP_FOLDER, 'resource.json' ),
					context: 'resource',
				},
			};
			let context = {};
			let success = await devops.Commands.$GetResource.Invoke( step, context );
			assert.ok( success );

			assert.ok( context.resource );
			assert.strictEqual( context.resource.url, step.url );
			assert.strictEqual( context.resource.headers.Host, 'httpbin.org' );

		} );

	} );


} );
