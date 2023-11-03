import { SidePanel } from 'lineupjs';
import { I18nextManager } from 'visyn_core/i18n';
import { EventHandler } from 'visyn_core/base';
import { PanelButton, PanelNavButton } from './PanelButton';
/**
 * The PanelTab creates a tab component that with can be toggled through the PanelNavButton
 */
export class PanelTab extends EventHandler {
    /**
     * @param parent The parent HTML DOM element
     * @param options Extra styles to apply to the PanelTab
     */
    constructor(parent, options) {
        super();
        this.parent = parent;
        this.options = {
            faIcon: 'fas fa-sliders-h',
            title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.rankingPanelTabTitle'),
            width: '26em',
            order: 0,
        };
        this.node = parent.ownerDocument.createElement('div');
        this.node.classList.add('tab-pane');
        this.node.setAttribute('role', 'tabpanel');
        Object.assign(this.options, options);
    }
    /**
     * Show this tab and fire the `PanelTab.SHOW_PANEL` event.
     */
    show() {
        this.node.classList.add('active');
        this.navButton.setActive(true);
        this.fire(PanelTab.SHOW_PANEL);
    }
    /**
     * Hide this tab and fire the `PanelTab.HIDE_PANEL` event.
     */
    hide() {
        this.node.classList.remove('active');
        this.navButton.setActive(false);
        this.fire(PanelTab.HIDE_PANEL);
    }
    getNavButton(listener) {
        this.navButton = new PanelNavButton(this.parent, listener, this.options);
        return this.navButton;
    }
    getShortcutButton() {
        const onClick = () => {
            this.navButton.click();
        };
        return new PanelButton(this.parent, {
            title: this.options.title,
            faIcon: this.options.faIcon,
            cssClass: 'shortcut-nav',
            onClick,
        });
    }
}
PanelTab.SHOW_PANEL = 'showPanel';
PanelTab.HIDE_PANEL = 'hidePanel';
/**
 * Default active PanelTab
 * Contains LineUp SidePanel and LineUp SearchBox
 */
export class SidePanelTab extends PanelTab {
    /**
     * @param parent The parent HTML DOM element
     * @param search LineUp SearchBox
     * @param ctx LineUp context
     * @param doc Document
     */
    constructor(parent, search, ctx, doc = document, options) {
        super(parent, options);
        this.search = search;
        this.node.classList.add('default');
        this.panel = new SidePanel(ctx, doc, {
            chooser: false,
        });
        this.node.appendChild(this.search.node);
        this.node.appendChild(this.panel.node);
    }
}
//# sourceMappingURL=PanelTab.js.map