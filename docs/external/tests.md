

  100) Initialization Tests
    CommandLine
      √ should process an empty command line
      √ should process a series of flags
      √ should handle up to two leading "-" characters for argument and flag names
      √ should process a series of positional arguments
      √ should process a series of named arguments
    Command Loading
      √ should load standard commands
      √ should not load commands starting with a "_" or "~"
    FindAllBetween
      √ should find all text when no start or end tokens are given
      √ should find all text from a start token
      √ should find all text up to an end token
      √ should find text between two tokens
      √ should not find text when tokens are not found
      √ should find text between two tokens even when they are the same
      √ should find multiple occurances between two tokens
      √ should return only max occurances


  15 passing (11ms)

