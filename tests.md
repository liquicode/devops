```


  100) Initialization Tests
    CommandLine
      ✔ should process an empty command line
      ✔ should process a series of flags
      ✔ should handle up to two leading "-" characters for argument and flag names
      ✔ should process a series of positional arguments
      ✔ should process a series of named arguments
    Command Loading
      ✔ should load standard commands
      ✔ should not load commands starting with a "_" or "~"
    FindAllBetween
      ✔ should find all text when no start or end tokens are given
      ✔ should find all text from a start token
      ✔ should find all text up to an end token
      ✔ should find text between two tokens
      ✔ should not find text when tokens are not found
      ✔ should find text between two tokens even when they are the same
      ✔ should find multiple occurances between two tokens
      ✔ should return only max occurances
    FormatConsoleOutput
┌──[ License ]───────────────────────────────────────────────────────────────────┐
│ MIT License                                                                    │
│                                                                                │
│ Copyright (c) 2023 liquicode                                                   │
│                                                                                │
│ Permission is hereby granted, free of charge, to any person obtaining a copy   │
│ of this software and associated documentation files (the "Software"), to deal  │
│ in the Software without restriction, including without limitation the rights   │
│ to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      │
│ copies of the Software, and to permit persons to whom the Software is          │
│ furnished to do so, subject to the following conditions:                       │
│                                                                                │
│ The above copyright notice and this permission notice shall be included in all │
│ copies or substantial portions of the Software.                                │
│                                                                                │
│ THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     │
│ IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       │
│ FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    │
│ AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         │
│ LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  │
│ OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  │
│ SOFTWARE.                                                                      │
└────────────────────────────────────────────────────────────────────────────────┘
      ✔ should format console output

  200) Child Process Tests
    $Shell
      ✔ it runs a simple shell command and captures the output (30ms)

  300) Context Tests
    $LoadJsModule
      ✔ it loads a Javascript module into a Context field
    $PrintContext
      ✔ it prints the Context to a file (6ms)
    $SemverInc
      ✔ it increments a semver version number
    $SetContext
      ✔ it sets a field value in the Context

  600) Internet Tests
    $GetResource
      ✔ should download an html file (494ms)
      ✔ should make an API call (87ms)


  23 passing (627ms)

```
