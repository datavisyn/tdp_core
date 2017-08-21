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
  registry.push('actionCompressor', 'tdpCompressSetParameter', function () { return import('./src/internal/cmds') }, {
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


  registry.push('actionFunction', 'tdpAddScore', function () { return import('./src/lineup/internal/scorecmds') }, {
    'factory': 'addScoreImpl'
  });
  registry.push('actionFunction', 'tdpRemoveScore', function () { return import('./src/lineup/internal/scorecmds') }, {
    'factory': 'removeScoreImpl'
  });

  registry.push('actionCompressor', 'tdpScoreCompressor', function() { return import('./src/lineup/internal/scorecmds'); }, {
    'factory': 'compress',
    'matches': '(tdpAddScore|tdpRemoveScore)'
   });

  // compatibility
  registry.push('actionFunction', 'ordinoAddScore', function () { return import('./src/lineup/internal/scorecmds') }, {
    'factory': 'addScoreImpl'
  });
  registry.push('actionFunction', 'ordinoRemoveScore', function () { return import('./src/lineup/internal/scorecmds') }, {
    'factory': 'removeScoreImpl'
  });
  registry.push('actionCompressor', 'ordinoScoreCompressor', function() { return import('./src/lineup/internal/scorecmds'); }, {
    'factory': 'compressComp',
    'matches': '(ordinoAddScore|ordinoRemoveScore)'
  });

  registry.push('actionFunction', 'lineupAddRanking', function () { return import('./src/lineup/internal/cmds') }, {
    'factory': 'addRankingImpl'
  });
  registry.push('actionFunction', 'lineupSetRankingSortCriteria', function () { return import('./src/lineup/internal/cmds') }, {
    'factory': 'setRankingSortCriteriaImpl'
  });
  registry.push('actionFunction', 'lineupSetColumn', function () { return import('./src/lineup/internal/cmds') }, {
    'factory': 'setColumnImpl'
  });
  registry.push('actionFunction', 'lineupAddRanking', function () { return import('./src/lineup/internal/cmds') }, {
    'factory': 'addColumnImpl'
  });


  // generator-phovea:end
};
