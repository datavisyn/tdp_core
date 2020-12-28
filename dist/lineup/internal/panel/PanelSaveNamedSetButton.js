import { EventHandler, I18nextManager } from 'phovea_core';
import { StoreUtils } from '../../../storage';
import { LineUpOrderedRowIndicies } from './LineUpOrderedRowIndicies';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export class PanelSaveNamedSetButton extends EventHandler {
    constructor(parent, lineupOrderRowIndices, isTopMode) {
        super();
        this.node = parent.ownerDocument.createElement('div');
        this.node.classList.add('btn-group', 'save-named-set-dropdown');
        this.node.innerHTML = `
      <button type="button" class="dropdown-toggle fas fa-save" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.saveEntities')}">
      </button>
      <ul class="dropdown-menu dropdown-menu-${isTopMode ? 'left' : 'right'}">
        <li class="dropdown-header">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.saveEntities')}</li>
        <li data-num-all-rows="0"><a href="#" data-rows="all" data-num-all-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.saveEntireList')}</a></li>
        <li data-num-filtered-rows="0"><a href="#" data-rows="filtered" data-num-filtered-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.saveFilteredRows')}</a></li>
        <li data-num-selected-rows="0"><a href="#" data-rows="selected" data-num-selected-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.saveSelectedRows')}</a></li>
      </ul>
    `;
        lineupOrderRowIndices.on(LineUpOrderedRowIndicies.EVENT_UPDATE_ALL, (_event, order) => {
            this.node.querySelectorAll('[data-num-all-rows]').forEach((element) => element.dataset.numAllRows = order.length.toString());
        });
        lineupOrderRowIndices.on(LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED, (_event, order) => {
            this.node.querySelectorAll('[data-num-selected-rows]').forEach((element) => element.dataset.numSelectedRows = order.length.toString());
        });
        lineupOrderRowIndices.on(LineUpOrderedRowIndicies.EVENT_UPDATE_FILTERED, (_event, order) => {
            this.node.querySelectorAll('[data-num-filtered-rows]').forEach((element) => element.dataset.numFilteredRows = order.length.toString());
        });
        this.node.querySelectorAll('a').forEach((link) => {
            link.onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                StoreUtils.editDialog(null, (name, description, sec) => {
                    this.fire(PanelSaveNamedSetButton.EVENT_SAVE_NAMED_SET, lineupOrderRowIndices[link.dataset.rows], name, description, sec);
                });
                return false;
            };
        });
    }
}
PanelSaveNamedSetButton.EVENT_SAVE_NAMED_SET = 'saveNamedSet';
//# sourceMappingURL=PanelSaveNamedSetButton.js.map