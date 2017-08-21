/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

/**
 * generates and object that contain all modules in the src folder accessible as properties
 */

/**
 * magic file name for the pseudo root file
 * @type {string}
 */
var INDEX_FILE = './index.ts';
/**
 * sorts the given filename by name ensuring INDEX is the first one
 * @param a
 * @param b
 * @returns {number}
 */
function byName(a, b) {
  if (a === INDEX_FILE) {
    return a === b ? 0 : -1;
  }
  if (b === INDEX_FILE) {
    return 1;
  }
  return a.toLowerCase().localeCompare(b.toLowerCase());
}
// list all modules in the src folder excluding the one starting with _
var req = require.context('./src', true, /^\.\/(?!internal)(([^_][\w]+)|(\w+\/index))\.tsx?$/);

var files = req.keys().sort(byName);

// root file exists? else use anonymous root object
if (files[0] === INDEX_FILE) {
  module.exports = req(files.shift());
} else {
  module.exports = {};
}

// generate getter for all modules
files.forEach(function (f) {
  Object.defineProperty(module.exports, f.substring(2, f.lastIndexOf('/index.') > 0 ? f.lastIndexOf('/index.') : f.lastIndexOf('.')), {
    get: function () {
      return req(f);
    },
    enumerable: true
  });
});
