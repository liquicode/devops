
## Output Options for Commands

Many Commands support a set of output options specified in the `out` parameter.
The `out` parameter is a an object which contains one or more of the following fields:

- as: Converts the output before further processing. Can be one of: 'string', 'json', 'json-friendly', or empty.
- log : Boolean to send output to the devop's log. Defaults to `false`.
- console : Boolean to send output to console. Defaults to `false`.
- filename : String filename to store output to.
- context : Context field name to store output to.

