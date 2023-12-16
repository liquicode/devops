'use strict';

const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );

module.exports = function ( Engine )
{
	let Command = {


		//---------------------------------------------------------------------
		Meta: {
			Category: 'Internet',
			CommandName: '$GetResource',
			CommandHelp: `Downloads a resource from the internet and stores it to a file and/or Context variable.`,
			CommandFields: [
				{ name: 'url', type: 's', description: `The URL of the resource.` },
				{ name: 'as', type: 's', default: 'binary', description: `Format of the resource, one of: 'binary', 'string', 'json'.` },
				{ name: 'out.as', type: 's', default: '', description: `Convert to one of these formats before output: 'string', 'json', 'json-friendly'. Leave empty for no conversion.` },
				{ name: 'out.console', type: 'b', default: false, description: `Send output to the console (i.e. console.log).` },
				{ name: 'out.log', type: 'b', default: false, description: `Send output to the devop's log.` },
				{ name: 'out.filename', type: 's', default: '', description: `Send output to a file.` },
				{ name: 'out.context', type: 's', default: '', description: `The name of a Context field to send the output to.` },
			],
		},


		//---------------------------------------------------------------------
		Invoke: async function ( Step, Context )
		{
			if ( typeof Step === 'undefined' ) { throw new Error( `The [Step] parameter is required.` ); }
			if ( typeof Step.url === 'undefined' ) { throw new Error( `The [url] string parameter is required.` ); }

			// Instantiate the http engine.
			let http_engine = null;
			if ( Step.url.toLowerCase().startsWith( 'http:' ) ) { http_engine = LIB_HTTP; }
			else if ( Step.url.toLowerCase().startsWith( 'https:' ) ) { http_engine = LIB_HTTPS; }
			else { throw new Error( `Unsupported protocol. Must be http or https.` ); }

			// Get the resource.
			let resource = await new Promise(
				( resolve, reject ) =>
				{
					try
					{
						http_engine.get(
							Step.url,
							function ( response ) 
							{
								let resource = [];
								response.on( 'data', data =>
								{
									resource.push( ...data );
								} );
								response.on( 'end', () =>
								{
									resolve( resource );
								} );
							} );
					}
					catch ( error )
					{
						reject( error );
					}
				} );

			if ( Step.as )
			{
				if ( Step.as === 'string' )
				{
					let buffer = Buffer.from( resource );
					resource = buffer.toString( 'ascii' );
				}
				else if ( Step.as === 'json' )
				{
					let buffer = Buffer.from( resource );
					resource = buffer.toString( 'ascii' );
					resource = JSON.parse( resource );
				}
			}

			// if ( Step.out && ( [ 'string', 'json', 'json-friendly' ].includes( Step.out.as ) ) )
			// {
			// 	let buffer = Buffer.from( resource );
			// 	resource = buffer.toString( 'ascii' );
			// 	if ( Step.out.as.startsWith( 'json' ) )
			// 	{
			// 		resource = JSON.parse( resource );
			// 	}
			// }

			Engine.SendOutput( Context, Step.out, resource );

			return true;
		},
	};

	// Return the command.
	return Command;
};
