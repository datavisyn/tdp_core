import { SidePanel, SearchBox, IEngineRankingContext, IRenderContext, IRankingHeaderContextContainer } from 'lineupjs';
import { I18nextManager } from 'visyn_core/i18n';
import { EventHandler } from 'visyn_core/base';
import { ISearchOption } from './ISearchOption';
import { PanelButton, PanelNavButton } from './PanelButton';
import { IPanelTabDesc } from './IPanelTabDesc';

/**
 * The PanelTab creates a tab component that with can be toggled through the PanelNavButton
 */
export class PanelTab extends EventHandler {
  static readonly SHOW_PANEL = 'showPanel';

  static readonly HIDE_PANEL = 'hidePanel';

  readonly node: HTMLElement;

  readonly options: IPanelTabDesc = {
    faIcon: 'fas fa-sliders-h',
    title: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.rankingPanelTabTitle'),
    width: '26em',
    order: 0,
  };

  private navButton: PanelNavButton;

  /**
   * @param parent The parent HTML DOM element
   * @param options Extra styles to apply to the PanelTab
   */
  constructor(
    private parent: HTMLElement,
    options?: IPanelTabDesc,
  ) {
    super();

    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tab-pane');
    this.node.setAttribute('role', 'tabpanel');
    Object.assign(this.options, options);
  }

  /**
   * Show this tab and fire the `PanelTab.SHOW_PANEL` event.
   */
  public show() {
    this.node.classList.add('active');
    this.navButton.setActive(true);
    this.fire(PanelTab.SHOW_PANEL);
  }

  /**
   * Hide this tab and fire the `PanelTab.HIDE_PANEL` event.
   */
  public hide() {
    this.node.classList.remove('active');
    this.navButton.setActive(false);
    this.fire(PanelTab.HIDE_PANEL);
  }

  getNavButton(listener): PanelNavButton {
    this.navButton = new PanelNavButton(this.parent, listener, this.options);
    return this.navButton;
  }

  getShortcutButton(): PanelButton {
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

/**
 * Default active PanelTab
 * Contains LineUp SidePanel and LineUp SearchBox
 */
export class SidePanelTab extends PanelTab {
  readonly panel: SidePanel | null;

  /**
   * @param parent The parent HTML DOM element
   * @param search LineUp SearchBox
   * @param ctx LineUp context
   * @param doc Document
   */
  constructor(
    parent: HTMLElement,
    private readonly search: SearchBox<ISearchOption>,
    ctx: IRankingHeaderContextContainer & IRenderContext & IEngineRankingContext,
    doc = document,
    options?: IPanelTabDesc,
  ) {
    super(parent, options);
    this.node.classList.add('default');
    this.panel = new SidePanel(ctx, doc, {
      chooser: false,
    });

    this.node.appendChild(this.search.node);
    this.node.appendChild(this.panel.node);
  }
}
