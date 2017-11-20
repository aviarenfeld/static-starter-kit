## Setup:

Ensure global dependencies:

1. Node https://nodejs.org/
2. Global NPM packages: `npm install -g bower gulp`
3. Local NPM packages: `npm install`
4. Bower packages: `bower install`
5. For sketch-based icon font generation: http://bohemiancoding.com/sketch/tool/
> Gulp tasks may throw an error wihtout this sketchtool installed. Should check this and trap for it.

## Gulp Tasks:

`gulp`: Runs clean, then dev.
`gulp dev`: Runs build, watch and server.
`gulp build`: Runs all the actual build tasks.
`gulp xxx --environment production` runs any of the above commands using the produciton environment config. Configuration options include flags for minifying, etc.
