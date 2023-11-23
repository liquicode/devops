'use strict';

module.exports = function ()
{

	let Parameters = {

		//---------------------------------------------------------------------
		FromList: function ( ArgumentList )
		{
			let parameters = {
				flags: {},
				positional: [],
			};
			let name = null;
			for ( let index = 0; index < ArgumentList.length; index++ )
			{
				let entry = ArgumentList[ index ];
				if ( typeof entry !== 'string' ) { entry = entry.toString(); }
				if ( name === null )
				{
					if ( entry.startsWith( '-' ) )
					{
						if ( entry.startsWith( '-' ) ) { entry = entry.substring( 1 ); }
						if ( entry.startsWith( '-' ) ) { entry = entry.substring( 1 ); }
						name = entry.toLowerCase();
					}
					else
					{
						parameters.positional.push( entry );
					}
				}
				else
				{
					if ( entry.startsWith( '-' ) )
					{
						if ( entry.startsWith( '-' ) ) { entry = entry.substring( 1 ); }
						if ( entry.startsWith( '-' ) ) { entry = entry.substring( 1 ); }
						parameters.flags[ name ] = true;
						name = entry.toLowerCase();
					}
					else
					{
						parameters[ name ] = entry;
						name = null;
					}
				}
				if ( name !== null ) { parameters.flags[ name ] = true; }
			}
			return parameters;
		},

		//---------------------------------------------------------------------
		FromCommandLine: function ()
		{
			let list = process.argv.slice( 2 );
			let result = Parameters.FromList( list );
			return result;
		},


	};

	return Parameters;
};
