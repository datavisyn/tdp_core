import { BaseUtils } from '../base/BaseUtils';
import { Store } from './Store';
import { PluginRegistry } from '../app/PluginRegistry';
export class TabSyncer {
    constructor(options) {
        this.options = {
            keyPrefix: 'tab-sync-',
            storage: localStorage,
        };
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
    push(syncer) {
        syncer(this.store);
    }
    registerTab(url) {
        const list = this.getTabList();
        list.push(url);
        this.store.setValue(TabSyncer.TAB_LIST, list);
    }
    static handleChange(event, key, newValue, oldValue, url) {
        console.log('change in local storage', key, newValue, oldValue, url);
    }
    unregisterTab(url) {
        const list = this.getTabList();
        const i = list.indexOf(url);
        if (i >= 0) {
            list.splice(i, 1);
            this.store.setValue(TabSyncer.TAB_LIST, list);
        }
    }
    getTabList() {
        return this.store.getValue(TabSyncer.TAB_LIST, []);
    }
}
TabSyncer.SYNCER_EXTENSION_POINT = 'tabSyncer';
TabSyncer.TAB_LIST = 'tabList';
//# sourceMappingURL=TabSyncer.js.map