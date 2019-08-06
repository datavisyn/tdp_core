/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import {IRegistry} from 'phovea_core/src/plugin';
import {FormElementType} from './form';
import {FORM_EXTENSION_POINT} from './form';

export default function (registry: IRegistry) {
  function actionFunction(id: string, factory: string, loader: () => any) {
    registry.push('actionFunction', id, loader, { factory });
  }

  function actionCompressor(id: string, factory: string, matches: string, loader: () => any) {
    registry.push('actionCompressor', id, loader, { factory, matches });
  }

  function formElements(id: string, loader: () => any, options?: any) {
    registry.push(FORM_EXTENSION_POINT, id, loader, options);
  }

  actionFunction('tdpInitSession', 'initSessionImpl', () => System.import('./internal/cmds'));
  actionFunction('tdpSetParameter', 'setParameterImpl', () => System.import('./internal/cmds'));
  actionCompressor('tdpCompressSetParameter', 'compressSetParameter', '(tdpSetParameter)', () => System.import('./internal/cmds'));

  // compatibility
  actionFunction('targidInitSession', 'initSessionImpl', () => System.import('./internal/cmds'));
  actionFunction('targidSetParameter', 'setParameterImpl', () => System.import('./internal/cmds'));
  actionCompressor('targidCompressSetParameter', 'compressSetParameterOld', '(targidSetParameter)', () => System.import('./internal/cmds'));


  actionFunction('tdpAddScore', 'addScoreImpl', () => System.import('./lineup/internal/scorecmds'));
  actionFunction('tdpRemoveScore', 'removeScoreImpl', () => System.import('./lineup/internal/scorecmds'));
  actionCompressor('tdpScoreCompressor', 'compress', '(tdpAddScore|tdpRemoveScore)', () => System.import('./lineup/internal/scorecmds'));

  // compatibility
  actionFunction('ordinoAddScore', 'addScoreImpl', () => System.import('./lineup/internal/scorecmds'));
  actionFunction('ordinoRemoveScore', 'removeScoreImpl', () => System.import('./lineup/internal/scorecmds'));
  actionCompressor('ordinoScoreCompressor', 'compressComp', '(ordinoAddScore|ordinoRemoveScore)', () => System.import('./lineup/internal/scorecmds'));

  actionFunction('lineupAddRanking', 'addRankingImpl', () => System.import('./lineup/internal/cmds'));
  actionFunction('lineupSetRankingSortCriteria', 'setRankingSortCriteriaImpl', () => System.import('./lineup/internal/cmds'));
  actionFunction('lineupSetSortCriteria', 'setSortCriteriaImpl', () => System.import('./lineup/internal/cmds'));
  actionFunction('lineupSetGroupCriteria', 'setGroupCriteriaImpl', () => System.import('./lineup/internal/cmds'));
  actionFunction('lineupSetColumn', 'setColumnImpl', () => System.import('./lineup/internal/cmds'));
  actionFunction('lineupAddColumn', 'addColumnImpl', () => System.import('./lineup/internal/cmds'));
  actionFunction('lineupMoveColumn', 'moveColumnImpl', () => System.import('./lineup/internal/cmds'));

  formElements(FormElementType.SELECT, () => System.import('./form/internal/FormSelect'));
  formElements(FormElementType.SELECT2, () => System.import('./form/internal/FormSelect2'), { selection: 'single' });
  formElements(FormElementType.SELECT2_MULTIPLE, () => System.import('./form/internal/FormSelect2'), { selection: 'multiple' });
  formElements(FormElementType.SELECT3, () => System.import('./form/internal/FormSelect3'), { selection: 'single' });
  formElements(FormElementType.SELECT3_MULTIPLE, () => System.import('./form/internal/FormSelect3'), { selection: 'multiple' });
  formElements(FormElementType.INPUT_TEXT, () => System.import('./form/internal/FormInputText'));
  formElements(FormElementType.MAP, () => System.import('./form/internal/FormMap'));
  formElements(FormElementType.BUTTON, () => System.import('./form/internal/FormButton'));
  formElements(FormElementType.CHECKBOX, () => System.import('./form/internal/FormCheckBox'));
  formElements(FormElementType.RADIO, () => System.import('./form/internal/FormRadio'));

}
