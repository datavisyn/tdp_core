/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function (registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  // generator-phovea:begin

  registry.push('actionFunction', 'tdpInitSession', function () { return import('./src/internal/cmds') }, {
    'factory': 'initSessionImpl'
  });
  registry.push('actionFunction', 'tdpSetParameter', function () { return import('./src/internal/cmds') }, {
    'factory': 'setParameterImpl'
  });
  registry.push('actionCompressor', 'tdpCompressSetParameter', function () {
    return System.import('./src/internal/cmds');
  }, {
    'factory': 'compressSetParameter',
    'matches': '(tdpSetParameter)'
  });

  // compatibility
  registry.push('actionFunction', 'targidInitSession', function () { return import('./src/internal/cmds') }, {
    'factory': 'initSessionImpl'
  });
  registry.push('actionFunction', 'targidSetParameter', function () { return import('./src/internal/cmds') }, {
    'factory': 'setParameterImpl'
  });
  registry.push('actionCompressor', 'targidCompressSetParameter', function () {
    return import('./src/internal/cmds');
  }, {
    'factory': 'compressSetParameterOld',
    'matches': '(targidSetParameter)'
  });





  registry.push('actionFactory', 'ordinoScore', function() { return import('./src/lineup/scorecmds'); }, {
  'factory': 'createCmd',
  'creates': '(ordinoAddScore|ordinoRemoveScore)'
 });

  registry.push('actionCompressor', 'ordinoScoreCompressor', function() { return import('./src/lineup/scorecmds'); }, {
  'factory': 'compress',
  'matches': '(ordinoAddScore|ordinoRemoveScore)'
 });

  registry.push('targidStartMenuSection', 'targid_temporary_session', function () {
    return import('./src/SessionList');
  }, {
    name: 'Temporary Sessions <i class="fa fa-question-circle-o" title="temporary sessions are stored on your local browser only and are limited to the 5 recent ones"></i>',
    cssClass: 'targidSessionTemporaryData',
    factory: 'createTemporary',
    priority: 90
  });

  registry.push('targidStartMenuSection', 'targid_persistent_session', function () {
    return import('./src/SessionList');
  }, {
    name: 'Persistent Sessions',
    cssClass: 'targidSessionPersistentData',
    factory: 'createPersistent',
    priority: 95
  });

  // generator-phovea:end
};
