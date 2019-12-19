import {PanelTab} from './PanelTab';

export default class PanelTabContainer {

  readonly node: HTMLElement;

  private tabs: PanelTab[] = [];

  private currentTab: PanelTab;

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('main');
    this.node.classList.add('tab-content');
    parent.appendChild(this.node);
  }

  private get defaultTab(): PanelTab {
    return this.tabs[0];
  }

  addTab(tab: PanelTab) {
    this.tabs = [...this.tabs, tab];
    this.node.appendChild(tab.node);
  }

  toggle(tab: PanelTab) {
    if (this.currentTab === tab) {
      this.hide(tab);

    } else {
      this.show(tab);
    }
  }

  showDefault() {
    const openedTab = this.tabs.find((tab) => tab.node.classList.contains('tab-pane') && tab.node.classList.contains('active'));
    if (openedTab) {
      this.hide(openedTab);
    }
  }

  show(tab: PanelTab) {
    if (this.currentTab) {
      this.currentTab.hide();
    }

    tab.show();
    this.currentTab = tab;
  }

  hide(tab: PanelTab) {
    tab.hide();
    this.defaultTab.show();
    this.currentTab = this.defaultTab;
  }
}
