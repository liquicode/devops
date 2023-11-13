'use strict';

const assert = require( 'assert' );
const DEVOPS = require( '../src/DevOpsEngine' )( {}, {} );

describe( '100) Initialization Tests', () =>
{

	describe( 'Commands', () =>
	{

		it( 'should load standard commands', () => 
		{
			assert.ok( DEVOPS.Commands );
			assert.ok( typeof DEVOPS.Commands.$ClearFolder !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$CopyFile !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$EnsureFolder !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$Halt !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$Noop !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$ReadJsonFile !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$ReadTextFile !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$RemoveFolder !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$ReplaceFileText !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$RunTask !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$SemverInc !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$Shell !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$WriteJsonFile !== 'undefined' );
			assert.ok( typeof DEVOPS.Commands.$WriteTextFile !== 'undefined' );
		} );

		it( 'should not load commands starting with a "_" or "~"', () => 
		{
			assert.ok( DEVOPS.Commands );
			assert.ok( typeof DEVOPS.Commands.$_blank === 'undefined' );
		} );

	} );


} );
