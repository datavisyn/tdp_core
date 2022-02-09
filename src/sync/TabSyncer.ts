import { BaseUtils } from '../base/BaseUtils';
import { Store } from './Store';
import { PluginRegistry } from '../app/PluginRegistry';

export interface ITabSyncerOptions {
  keyPrefix?: string;
  storage?: Storage;
}

export interface ISyncerExtension {
  (store: Store);
}

export class TabSyncer {
  public static SYNCER_EXTENSION_POINT = 'tabSyncer';

  private static TAB_LIST = 'tabList';

  private options: ITabSyncerOptions = {
    keyPrefix: 'tab-sync-',
    storage: localStorage,
  };

  private store: Store;

  constructor(options?: ITabSyncerOptions) {
    BaseUtils.mixin(this.options, options);

    this.store = new Store(this.options.storage, this.options.keyPrefix);
    this.store.on(Store.EVENT_CHANGED, TabSyncer.handleChange.bind(this));

    // instantiate plugins
    PluginRegistry.getInstance()
      .loadPlugin(PluginRegistry.getInstance().listPlugins(TabSyncer.SYNCER_EXTENSION_POINT))
      .then((instances) => {
        instances.forEach((i) => this.push(i.factory));
      });

    this.registerTab(document.location.href);

    window.addEventListener('beforeunload', () => {
      this.unregisterTab(document.location.href);
    });
  }

  push(syncer: ISyncerExtension) {
    syncer(this.store);
  }

  private registerTab(url: string) {
    const list = this.getTabList();
    list.push(url);
    this.store.setValue(TabSyncer.TAB_LIST, list);
  }

  private static handleChange(event: any, key: string, newValue: any, oldValue: any, url: string) {
    console.log('change in local storage', key, newValue, oldValue, url);
  }

  private unregisterTab(url: string) {
    const list = this.getTabList();
    const i = list.indexOf(url);
    if (i >= 0) {
      list.splice(i, 1);
      this.store.setValue(TabSyncer.TAB_LIST, list);
    }
  }

  getTabList(): string[] {
    return this.store.getValue(TabSyncer.TAB_LIST, <string[]>[]);
  }
}
