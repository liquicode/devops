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
			// assert.ok( typeof devops.Commands.$ReplaceFileText !== 'undefined' );
			assert.ok( typeof devops.Commands.$RunTask !== 'undefined' );
			assert.ok( typeof devops.Commands.$SemverInc !== 'undefined' );
			assert.ok( typeof devops.Commands.$Shell !== 'undefined' );
			// assert.ok( typeof devops.Commands.$WriteJsonFile !== 'undefined' );
			// assert.ok( typeof devops.Commands.$WriteTextFile !== 'undefined' );
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


	describe( 'FormatConsoleOutput', () =>
	{

		it( 'should format console output', () => 
		{
			let text = `MIT License

Copyright (c) 2023 liquicode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

			console.log( devops.Loose.FormatConsoleOutput( 'License', text, 120 ) );
		} );


	} );


} );
