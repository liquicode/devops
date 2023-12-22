# @liquicode/jsongin


# TODO

- Scripting/$ExecuteEjs
	- Validate/test the start code modifier: _
	- Validate/test the end code modifiers: _ and -

- Change `$PrintContext` to just `$Print` and specify the text to print.


# ADD

- Docker Container functions
	- $IsContainerRunning( ContainerName )
	- $StartContainer( ContainerName, ImageName, RunOptions )
	- $StopContainer( ContainerName )

- Environment Functions
	- $GetEnvironment( VariableName )
	- $SetEnvironment( VariableName, Value )

- JsonStorage Function (?)
	- $CreateStorage
	- $ReadStorage
	- $WriteStorage

- Content Functions
	- $Lorem()

- Internet Functions
	- $DownloadFile
	- $ApiCall
