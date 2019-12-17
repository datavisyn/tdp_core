import {LineUpPanelTab} from './LineUpPanelTab';

export default class LineUpPanelTabContainer {

  readonly node: HTMLElement;

  private tabs: LineUpPanelTab[] = [];

  private currentTab: LineUpPanelTab;

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('main');
    this.node.classList.add('tab-content');
    parent.appendChild(this.node);
  }

  private get defaultTab(): LineUpPanelTab {
    return this.tabs[0];
  }

  addTab(tab: LineUpPanelTab) {
    this.tabs = [...this.tabs, tab];
    this.node.appendChild(tab.node);
  }

  toggle(tab: LineUpPanelTab) {
    if (this.currentTab === tab) {
      this.hide(tab);

    } else {
      this.show(tab);
    }
  }

  show(tab: LineUpPanelTab) {
    if (this.currentTab) {
      this.currentTab.hide();
    }

    tab.show();
    this.currentTab = tab;
  }

  hide(tab: LineUpPanelTab) {
    tab.hide();
    this.defaultTab.show();
    this.currentTab = this.defaultTab;
  }
}
