# @liquicode/devops


# Project History


v0.0.20 (2024-05-20)
---------------------------------------------------------------------

- Updated to: @liquicode/jsongin v0.0.20
- Fixed `MODULE_NOT_FOUND` on later versions of node.
	- The underlying problem is that using `require` with an absolute path will load the module, yet emit this warning.
	- Commands are no longer dynamically loaded.


v0.0.19 (2023-12-22)
---------------------------------------------------------------------

- Updated docs.


v0.0.18 (2023-12-17)
---------------------------------------------------------------------

- Updated docs.


v0.0.17 (2023-12-17)
---------------------------------------------------------------------

- fixed `build/prod/devops.tasks.js`


v0.0.16
---------------------------------------------------------------------

- Not published.


v0.0.15 (2023-12-17)
---------------------------------------------------------------------

- Added Context commands:
	- `$LoadJsModule`
- Added File System commands:
	- `$CopyFolder`
- Added Flow Control commands:
	- `$If`
	- `$RunSteps`
- Added Scripting commands:
	- `$ExecuteJs`
	- `$ExecuteEjs`
- Added support for a `Context` initialization section within the Tasks file.
- Added initialization settings:
	- `CommandsCaseSensitive` Defaults to false.
- Added CLI:
	- Use `-h` or `--help` to get command list.
	- Use `-h $Command` or `--help $Command` to get help for a specific command.
	- Use `-h text` or `--help text` to search for a command.


v0.0.14
---------------------------------------------------------------------

- Not published.


v0.0.13
---------------------------------------------------------------------

- Not published.


v0.0.12 (2023-11-24)
---------------------------------------------------------------------

- Added Command: `$AppendTextFile`
- Added Command: `$PrependTextFile`

