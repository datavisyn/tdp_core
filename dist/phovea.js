/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import { PluginRegistry, EP_PHOVEA_CORE_LOCALE } from 'phovea_core';
import { FormElementType } from './form/interfaces';
import { EP_TDP_CORE_FORM_ELEMENT } from './base/extensions';
export default function (registry) {
    function actionFunction(id, factory, loader, options) {
        registry.push('actionFunction', id, loader, { factory, ...options });
    }
    function actionCompressor(id, factory, matches, loader) {
        registry.push('actionCompressor', id, loader, { factory, matches });
    }
    function formElements(id, loader, options) {
        registry.push(EP_TDP_CORE_FORM_ELEMENT, id, loader, options);
    }
    actionFunction('tdpInitSession', 'initSessionImpl', () => import('./utils/TDPApplicationUtils'), {
        analytics: {
            category: 'session',
            action: 'init'
        }
    });
    actionFunction('tdpSetParameter', 'setParameterImpl', () => import('./utils/TDPApplicationUtils'), {
        analytics: {
            category: 'view',
            action: 'setParameter'
        }
    });
    actionCompressor('tdpCompressSetParameter', 'compressSetParameter', '(tdpSetParameter)', () => import('./utils/TDPApplicationUtils'));
    // compatibility
    actionFunction('targidInitSession', 'initSessionImpl', () => import('./utils/TDPApplicationUtils'));
    actionFunction('targidSetParameter', 'setParameterImpl', () => import('./utils/TDPApplicationUtils'));
    actionCompressor('targidCompressSetParameter', 'compressSetParameterOld', '(targidSetParameter)', () => import('./utils/TDPApplicationUtils'));
    actionFunction('tdpAddScore', 'addScoreImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'score',
            action: 'add'
        }
    });
    actionFunction('tdpRemoveScore', 'removeScoreImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'score',
            action: 'remove'
        }
    });
    actionCompressor('tdpScoreCompressor', 'compress', '(tdpAddScore|tdpRemoveScore)', () => import('./lineup/internal/ScoreUtils'));
    // compatibility
    actionFunction('ordinoAddScore', 'addScoreImpl', () => import('./lineup/internal/ScoreUtils'));
    actionFunction('ordinoRemoveScore', 'removeScoreImpl', () => import('./lineup/internal/ScoreUtils'));
    actionCompressor('ordinoScoreCompressor', 'compressComp', '(ordinoAddScore|ordinoRemoveScore)', () => import('./lineup/internal/ScoreUtils'));
    actionFunction('lineupAddRanking', 'addRankingImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'addRanking'
        }
    });
    actionFunction('lineupSetRankingSortCriteria', 'setRankingSortCriteriaImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'setRankingSortCriteria'
        }
    });
    actionFunction('lineupSetSortCriteria', 'setSortCriteriaImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'setSortCriteria'
        }
    });
    actionFunction('lineupSetGroupCriteria', 'setGroupCriteriaImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'setGroupCriteria'
        }
    });
    actionFunction('lineupSetColumn', 'setColumnImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'setColumn'
        }
    });
    actionFunction('lineupAddColumn', 'addColumnImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'addColumn'
        }
    });
    actionFunction('lineupMoveColumn', 'moveColumnImpl', () => import('./lineup/internal/ScoreUtils'), {
        analytics: {
            category: 'lineup',
            action: 'moveColumn'
        }
    });
    formElements(FormElementType.SELECT, () => import('./form/elements/FormSelect'));
    formElements(FormElementType.SELECT2, () => import('./form/elements/FormSelect2'), { selection: 'single' });
    formElements(FormElementType.SELECT2_MULTIPLE, () => import('./form/elements/FormSelect2'), { selection: 'multiple' });
    formElements(FormElementType.SELECT3, () => import('./form/elements/FormSelect3'), { selection: 'single' });
    formElements(FormElementType.SELECT3_MULTIPLE, () => import('./form/elements/FormSelect3'), { selection: 'multiple' });
    formElements(FormElementType.INPUT_TEXT, () => import('./form/elements/FormInputText'));
    formElements(FormElementType.MAP, () => import('./form/elements/FormMap'));
    formElements(FormElementType.BUTTON, () => import('./form/elements/FormButton'));
    formElements(FormElementType.CHECKBOX, () => import('./form/elements/FormCheckBox'));
    formElements(FormElementType.RADIO, () => import('./form/elements/FormRadio'));
    registry.push(EP_PHOVEA_CORE_LOCALE, 'tdpCoreLocaleEN', function () {
        return import('./assets/locales/en/tdp.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'tdp',
    });
}
//# sourceMappingURL=phovea.js.map