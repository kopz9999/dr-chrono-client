'use strict';

var path = require('path');

module.exports = {
  path: path.join(process.cwd(), 'dist'),
  filename: 'scripts/[name].[hash].js',
  libraryTarget: "var",
  // name of the global var: "Foo"
  library: "DrChronoClient"
};
