const LIB_FS = require( 'fs' );

if ( process.version >= 'v14.14.0' )
{
	module.exports = LIB_FS.rmSync;
}
else
{
	module.exports = LIB_FS.rmdirSync;
}

