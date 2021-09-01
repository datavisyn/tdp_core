import { PanelButton } from './PanelButton';
import { I18nextManager } from 'phovea_core';
/**
 * Div HTMLElement that contains a button and a SearchBox.
 * The SearchBox is hidden by default and can be toggled by the button.
 */
export class PanelAddColumnButton {
    /**
     *
     * @param parent The parent HTML DOM element
     * @param search LineUp SearchBox instance
     */
    constructor(parent, search) {
        this.search = search;
        this.node = parent.ownerDocument.createElement('div');
        this.node.classList.add('lu-adder');
        this.node.addEventListener('mouseleave', () => {
            this.node.classList.remove('once');
        });
        const button = new PanelButton(this.node, {
            title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.addColumnButton'),
            faIcon: 'fas fa-plus',
            cssClass: 'btn-icon-bg-primary',
            onClick: () => {
                this.node.classList.add('once');
                this.search.node.querySelector('input').focus();
                this.search.focus();
            }
        });
        this.node.appendChild(button.node);
        this.node.appendChild(this.search.node);
    }
}
//# sourceMappingURL=PanelAddColumnButton.js.map