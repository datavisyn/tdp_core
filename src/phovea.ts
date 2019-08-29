/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import {IRegistry} from 'phovea_core/src/plugin';

export default function (registry: IRegistry) {
  function actionFunction(id: string, factory: string, loader: () => any, options?: {}) {
    registry.push('actionFunction', id, loader, { factory, ...options });
  }

  function actionCompressor(id: string, factory: string, matches: string, loader: () => any) {
    registry.push('actionCompressor', id, loader, { factory, matches });
  }

  actionFunction('tdpInitSession', 'initSessionImpl', () => System.import('./internal/cmds'), {
    tdp_matomo: {
      category: 'session',
      action: 'init'
    }
  });
  actionFunction('tdpSetParameter', 'setParameterImpl', () => System.import('./internal/cmds'), {
    tdp_matomo: {
      category: 'view',
      action: 'setParameter'
    }
  });
  actionCompressor('tdpCompressSetParameter', 'compressSetParameter', '(tdpSetParameter)', () => System.import('./internal/cmds'));

  // compatibility
  actionFunction('targidInitSession', 'initSessionImpl', () => System.import('./internal/cmds'));
  actionFunction('targidSetParameter', 'setParameterImpl', () => System.import('./internal/cmds'));
  actionCompressor('targidCompressSetParameter', 'compressSetParameterOld', '(targidSetParameter)', () => System.import('./internal/cmds'));


  actionFunction('tdpAddScore', 'addScoreImpl', () => System.import('./lineup/internal/scorecmds'), {
    tdp_matomo: {
      category: 'score',
      action: 'add'
    }
  });
  actionFunction('tdpRemoveScore', 'removeScoreImpl', () => System.import('./lineup/internal/scorecmds'), {
    tdp_matomo: {
      category: 'score',
      action: 'remove'
    }
  });
  actionCompressor('tdpScoreCompressor', 'compress', '(tdpAddScore|tdpRemoveScore)', () => System.import('./lineup/internal/scorecmds'));

  // compatibility
  actionFunction('ordinoAddScore', 'addScoreImpl', () => System.import('./lineup/internal/scorecmds'));
  actionFunction('ordinoRemoveScore', 'removeScoreImpl', () => System.import('./lineup/internal/scorecmds'));
  actionCompressor('ordinoScoreCompressor', 'compressComp', '(ordinoAddScore|ordinoRemoveScore)', () => System.import('./lineup/internal/scorecmds'));

  actionFunction('lineupAddRanking', 'addRankingImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'addRanking'
    }
  });
  actionFunction('lineupSetRankingSortCriteria', 'setRankingSortCriteriaImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'setRankingSortCriteria'
    }
  });
  actionFunction('lineupSetSortCriteria', 'setSortCriteriaImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'setSortCriteria'
    }
  });
  actionFunction('lineupSetGroupCriteria', 'setGroupCriteriaImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'setGroupCriteria'
    }
  });
  actionFunction('lineupSetColumn', 'setColumnImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'setColumn'
    }
  });
  actionFunction('lineupAddColumn', 'addColumnImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'addColumn'
    }
  });
  actionFunction('lineupMoveColumn', 'moveColumnImpl', () => System.import('./lineup/internal/cmds'), {
    tdp_matomo: {
      category: 'lineup',
      action: 'moveColumn'
    }
  });
}
