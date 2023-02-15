import md5 from 'md5';
import { PluginRegistry } from 'visyn_core/plugin';
import { AppContext } from './AppContext';
// assume `_pag` is already declared
window._paq = window._paq || [];
export class Matomo {
    init(config) {
        if (!config.url) {
            return false;
        }
        const userId = config.encryptUserName === true ? md5(this.userId) : this.userId;
        _paq.push(['setUserId', userId]);
        // _paq.push(['requireConsent']); TODO user consent form with opt out
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        // enable correct measuring of the site since it is a single page site
        _paq.push(['enableHeartBeatTimer']);
        _paq.push(['setTrackerUrl', `${config.url}matomo.php`]);
        _paq.push(['setSiteId', config.site]);
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.defer = true;
        s.src = `${config.url}matomo.js`;
        const base = document.getElementsByTagName('script')[0];
        base.insertAdjacentElement('beforebegin', s);
        return true;
    }
    trackEvent(category, action, name, value) {
        const t = ['trackEvent', category, action];
        if (typeof name === 'string') {
            t.push(name);
        }
        if (typeof value === 'number') {
            t.push(value);
        }
        _paq.push(t);
    }
    login(userId) {
        // store for later as we need to wait for the config to know whether the user name should be encrypted or not
        this.userId = userId;
    }
    logout() {
        _paq.push(['resetUserId']);
        _paq.push(['trackPageView']);
    }
    /**
     * Login extension point
     */
    static trackLogin(user) {
        Matomo.getInstance().login(user.name);
    }
    /**
     * Logout extension point
     */
    static trackLogout() {
        Matomo.getInstance().logout();
    }
    /**
     * Provenance graph extension point
     * @param graph ProvenanceGraph
     */
    static async trackProvenance(graph) {
        if (graph.isEmpty) {
            Matomo.getInstance().trackEvent('session', 'new', 'New Session');
        }
        else {
            Matomo.getInstance().trackEvent('session', 'continue', `${graph.desc.id} at state ${Math.max(...graph.states.map((s) => s.id))}`);
        }
        const trackableActions = new Map();
        // load all registered actionFunction extension points and look if they contain a `analytics` property
        PluginRegistry.getInstance()
            .listPlugins((desc) => desc.type === 'actionFunction' && desc.analytics)
            .forEach((desc) => {
            trackableActions.set(desc.id, desc.analytics);
        });
        graph.on('execute', (_, node) => {
            if (!Array.from(trackableActions.keys()).includes(node.getAttr('f_id'))) {
                return;
            }
            const event = trackableActions.get(node.getAttr('f_id'));
            Matomo.getInstance().trackEvent(event.category, event.action, typeof event.name === 'function' ? event.name(node) : node.name, typeof event.value === 'function' ? event.value(node) : null);
        });
        graph.on('run_chain', (_, nodes) => {
            Matomo.getInstance().trackEvent('provenance', 'runChain', 'Run actions in chain', nodes.length);
        });
        const config = await AppContext.getInstance().getAPIJSON('/tdp/config/matomo');
        Matomo.getInstance().init(config);
    }
    static getInstance() {
        if (!Matomo.instance) {
            Matomo.instance = new Matomo();
        }
        return Matomo.instance;
    }
}
//# sourceMappingURL=Matomo.js.map