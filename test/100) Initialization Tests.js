'use strict';

const assert = require( 'assert' );
const devops = require( '../src/Engine/DevOpsEngine' )( {}, {} );

describe( '100) Initialization Tests', () =>
{

	describe( 'CommandLine', () =>
	{
		const CommandLine = require( '../src/Engine/CommandLine' )();

		it( 'should process an empty command line', () => 
		{
			let args = CommandLine.FromList( [] );
			assert.ok( args );
			assert.ok( args.flags );
			assert.ok( Object.keys( args.flags ).length === 0 );
			assert.ok( args.positional );
			assert.ok( args.positional.length === 0 );
		} );

		it( 'should process a series of flags', () => 
		{
			let args = CommandLine.FromList( [ '-a', '-b', '-c' ] );
			assert.ok( args );
			assert.ok( args.flags );
			assert.ok( args.flags.a === true );
			assert.ok( args.flags.b === true );
			assert.ok( args.flags.c === true );
		} );

		it( 'should handle up to two leading "-" characters for argument and flag names', () => 
		{
			let args = CommandLine.FromList( [ '-a', '--b', '---c' ] );
			assert.ok( args );
			assert.ok( args.flags );
			assert.ok( args.flags.a === true );
			assert.ok( args.flags.b === true );
			assert.ok( args.flags[ '-c' ] === true );
		} );

		it( 'should process a series of positional arguments', () => 
		{
			let args = CommandLine.FromList( [ 'first', 'second', 'third' ] );
			assert.ok( args );
			assert.ok( args.positional );
			assert.ok( args.positional.length === 3 );
			assert.ok( args.positional[ 0 ] === 'first' );
			assert.ok( args.positional[ 1 ] === 'second' );
			assert.ok( args.positional[ 2 ] === 'third' );
		} );

		it( 'should process a series of named arguments', () => 
		{
			let args = CommandLine.FromList( [
				'-a', 'first',
				'-b', 'second',
				'-c', 'third',
			] );
			assert.ok( args );
			assert.ok( args.a );
			assert.ok( args.a === 'first' );
			assert.ok( args.b );
			assert.ok( args.b === 'second' );
			assert.ok( args.c );
			assert.ok( args.c === 'third' );
		} );

	} );


	describe( 'Command Loading', () =>
	{

		it( 'should load standard commands', () => 
		{
			assert.ok( devops.Commands );
			assert.ok( typeof devops.Commands.$ClearFolder !== 'undefined' );
			assert.ok( typeof devops.Commands.$CopyFile !== 'undefined' );
			assert.ok( typeof devops.Commands.$EnsureFolder !== 'undefined' );
			assert.ok( typeof devops.Commands.$Halt !== 'undefined' );
			assert.ok( typeof devops.Commands.$Noop !== 'undefined' );
			assert.ok( typeof devops.Commands.$ReadJsonFile !== 'undefined' );
			assert.ok( typeof devops.Commands.$ReadTextFile !== 'undefined' );
			assert.ok( typeof devops.Commands.$RemoveFolder !== 'undefined' );
			assert.ok( typeof devops.Commands.$ReplaceFileText !== 'undefined' );
			assert.ok( typeof devops.Commands.$RunTask !== 'undefined' );
			assert.ok( typeof devops.Commands.$SemverInc !== 'undefined' );
			assert.ok( typeof devops.Commands.$Shell !== 'undefined' );
			assert.ok( typeof devops.Commands.$WriteJsonFile !== 'undefined' );
			assert.ok( typeof devops.Commands.$WriteTextFile !== 'undefined' );
		} );

		it( 'should not load commands starting with a "_" or "~"', () => 
		{
			assert.ok( devops.Commands );
			assert.ok( typeof devops.Commands.$_blank === 'undefined' );
		} );

	} );


	describe( 'FindAllBetween', () =>
	{

		it( 'should find all text when no start or end tokens are given', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello world' );
			assert.ok( results.length === 1 );
			assert.ok( results[ 0 ] === 'hello world' );
		} );

		it( 'should find all text from a start token', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello!world', '!', null );
			assert.ok( results.length === 1 );
			assert.ok( results[ 0 ] === 'world' );
		} );

		it( 'should find all text up to an end token', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello!world', null, '!' );
			assert.ok( results.length === 1 );
			assert.ok( results[ 0 ] === 'hello' );
		} );

		it( 'should find text between two tokens', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello <world>', '<', '>' );
			assert.ok( results.length === 1 );
			assert.ok( results[ 0 ] === 'world' );
		} );

		it( 'should not find text when tokens are not found', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello *world*', '<', '>' );
			assert.ok( results.length === 0 );
		} );

		it( 'should find text between two tokens even when they are the same', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello*world*', '*', '*' );
			assert.ok( results.length === 1 );
			assert.ok( results[ 0 ] === 'world' );
		} );

		it( 'should find multiple occurances between two tokens', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello<world><foo>bar', '<', '>' );
			assert.ok( results.length === 2 );
			assert.ok( results[ 0 ] === 'world' );
			assert.ok( results[ 1 ] === 'foo' );
		} );

		it( 'should return only max occurances', () => 
		{
			let results = devops.Loose.FindAllBetween( 'hello<world><foo>bar', '<', '>', { MaxResults: 1 } );
			assert.ok( results.length === 1 );
			assert.ok( results[ 0 ] === 'world' );
		} );

	} );


	// describe( 'Find Text', () =>
	// {

	// 	it( 'should find all text when no start or end tokens are given', () => 
	// 	{
	// 		assert.ok( devops.Loose.FindBetween( 'hello world' ) === 'hello world' );
	// 	} );

	// 	it( 'should find all text from a start token', () => 
	// 	{
	// 		assert.ok( devops.Loose.FindBetween( 'hello!world', '!', null ) === 'world' );
	// 	} );

	// 	it( 'should find all text up to an end token', () => 
	// 	{
	// 		assert.ok( devops.Loose.FindBetween( 'hello!world', null, '!' ) === 'hello' );
	// 	} );

	// 	it( 'should find text between two tokens', () => 
	// 	{
	// 		assert.ok( devops.Loose.FindBetween( 'hello <world>', '<', '>' ) === 'world' );
	// 	} );

	// 	it( 'should find text between two tokens even when they are the same', () => 
	// 	{
	// 		assert.ok( devops.Loose.FindBetween( 'hello*world*', '*', '*' ) === 'world' );
	// 	} );

	// } );


	// describe( 'Replace Text', () =>
	// {

	// 	it( 'should replace all text when no start or end tokens are given', () => 
	// 	{
	// 		assert.ok( devops.Loose.ReplaceBetween( 'hello world', null, null, 'foo' ) === 'foo' );
	// 	} );

	// 	it( 'should replace all text from a start token', () => 
	// 	{
	// 		assert.ok( devops.Loose.ReplaceBetween( 'hello!world', '!', null, 'foo' ) === 'hello!foo' );
	// 	} );

	// 	it( 'should replace all text up to an end token', () => 
	// 	{
	// 		assert.ok( devops.Loose.ReplaceBetween( 'hello!world', null, '!', 'foo' ) === 'foo!world' );
	// 	} );

	// 	it( 'should replace text between two tokens', () => 
	// 	{
	// 		assert.ok( devops.Loose.ReplaceBetween( 'hello <world>', '<', '>', 'foo' ) === 'hello <foo>' );
	// 	} );

	// 	it( 'should replace text between two tokens even when they are the same', () => 
	// 	{
	// 		assert.ok( devops.Loose.ReplaceBetween( 'hello *world*', '*', '*', 'foo' ) === 'hello *foo*' );
	// 	} );

	// } );


} );
