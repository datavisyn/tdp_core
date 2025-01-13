import md5 from 'md5';
import { AppContext } from 'visyn_core/base';
import { PluginRegistry } from 'visyn_core/plugin';
import { IUser } from 'visyn_core/security';

import { ActionNode, ProvenanceGraph } from '../clue/provenance';

/**
 * Trackable Matomo event
 */
export interface IMatomoEvent {
  category: string;
  action: string;
  name?: (node: ActionNode) => string | string;
  value?: (node: ActionNode) => number | number;
}

/**
 * Trackable action
 */
export interface ITrackableAction {
  /**
   * phovea extension id
   */
  id: string;
  /**
   * matomo event
   */
  event: IMatomoEvent;
}

// assume `_pag` is already declared
(<any>window)._paq = (<any>window)._paq || [];
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const _paq: any[][];

interface IPhoveaMatomoConfig {
  /**
   * URL to Matomo backend with with a trailing slash
   * Use `null` to disables the tracking
   */
  url?: string;

  /**
   * ID of the Matomo site (generated when creating a page)
   */
  site: string;

  /**
   * Flag whether the user name should be encrypted using MD5 or not
   */
  encryptUserName?: boolean;
}

export class Matomo {
  private userId: string;

  init(config: IPhoveaMatomoConfig) {
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

  trackEvent(category: string, action: string, name?: string, value?: number) {
    const t: any[] = ['trackEvent', category, action];
    if (typeof name === 'string') {
      t.push(name);
    }
    if (typeof value === 'number') {
      t.push(value);
    }
    _paq.push(t);
  }

  login(userId: string) {
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
  static trackLogin(user: IUser) {
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
  static async trackProvenance(graph: ProvenanceGraph) {
    if (graph.isEmpty) {
      Matomo.getInstance().trackEvent('session', 'new', 'New Session');
    } else {
      Matomo.getInstance().trackEvent('session', 'continue', `${graph.desc.id} at state ${Math.max(...graph.states.map((s) => s.id))}`);
    }

    const trackableActions = new Map<string, IMatomoEvent>();

    // load all registered actionFunction extension points and look if they contain a `analytics` property
    PluginRegistry.getInstance()
      .listPlugins((desc) => desc.type === 'actionFunction' && desc.analytics)
      .forEach((desc) => {
        trackableActions.set(desc.id, desc.analytics);
      });

    graph.on('execute', (_, node: ActionNode) => {
      if (!Array.from(trackableActions.keys()).includes(node.getAttr('f_id'))) {
        return;
      }
      const event = trackableActions.get(node.getAttr('f_id'));
      Matomo.getInstance().trackEvent(
        event.category,
        event.action,
        typeof event.name === 'function' ? event.name(node) : node.name,
        typeof event.value === 'function' ? event.value(node) : null,
      );
    });

    graph.on('run_chain', (_, nodes: ActionNode[]) => {
      Matomo.getInstance().trackEvent('provenance', 'runChain', 'Run actions in chain', nodes.length);
    });

    const config: IPhoveaMatomoConfig = await AppContext.getInstance()
      .getAPIJSON('/tdp/config/matomo')
      .catch(() => ({}));
    Matomo.getInstance().init(config);
  }

  private static instance: Matomo;

  public static getInstance(): Matomo {
    if (!Matomo.instance) {
      Matomo.instance = new Matomo();
    }
    return Matomo.instance;
  }
}
