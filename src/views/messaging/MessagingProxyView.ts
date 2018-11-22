import AView from '../AView';
import {IViewContext, ISelection} from '../interfaces';
import {resolve} from 'phovea_core/src/idtype';
import {resolveIds} from '../resolve';
import {parse, none} from 'phovea_core/src/range';
import {ITDPMessage, ITDPSetItemSelectionMessage, ITDPSetParameterMessage} from './interfaces';


export interface IProxyViewOptions {
  /**
   * direct loading of an iframe site
   */
  site: string;
  /**
   * idtype of the argument
   */
  idtype: string;

  /**
   * idType of item selection
   */
  itemIDType: string;
}

export default class MessagingProxyView extends AView {
  protected options: IProxyViewOptions = {
    site: null,
    idtype: null,
    itemIDType: null
  };

  readonly naturalSize = [1280, 800];

  private iframeWindow: Window | null = null;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IProxyViewOptions> = {}) {
    super(context, selection, parent);
    Object.assign(this.options, context.desc, options);
  }

  get itemIDType() {
    if (!this.options.itemIDType) {
      return null;
    }
    return resolve(this.options.itemIDType);
  }

  protected initImpl() {
    super.initImpl();

    this.node.classList.add('proxy_view');

    return this.build();
  }

  private build() {
    if (MessagingProxyView.isNoNSecurePage(this.options.site)) {
      this.showNoHttpsMessage(this.options.site);
      return;
    }

    const iframe = this.node.ownerDocument.createElement('iframe');
    iframe.onload = () => {
      this.iframeWindow = iframe.contentWindow;
      // send initial selection
      this.sendInputSelectionMessage();
    };
    iframe.src = this.options.site;
    // listen on iframe events
    window.addEventListener('message', this.onWindowMessage);

    this.node.appendChild(iframe);
  }

  private onWindowMessage = (evt: MessageEvent) => {
    if (!this.iframeWindow || evt.source !== this.iframeWindow || !evt.data || (typeof evt.data.type !== 'string') || !evt.data.payload) {
      return;
    }
    const msg =  <ITDPMessage>evt.data;
    switch(msg.type) {
    case 'tdpSetItemSelection': {
      const payload = (<ITDPSetItemSelectionMessage>msg).payload;
      const ids: string[] = payload.ids;
      const idType = payload.idType ? resolve(payload.idType) : this.itemIDType;
      if (!ids || ids.length === 0) {
        this.setItemSelection({idtype: idType, range: none()});
      }

      if (!idType) {
        console.warn('cannot set item selection since of unknown idType');
        return;
      }
      idType.map(ids).then((r) => {
        this.setItemSelection({idtype: idType, range: parse(r)});
      });
      return;
    }
    case 'tdpSetParameter': {
      const payload = (<ITDPSetParameterMessage>msg).payload;
      const name = payload.name;
      const value = payload.value == null ? null : payload.value;
      if (!name) {
        console.warn('cannot set item parameter with no name');
        return;
      }
      this.changeParameter(name, value);
      return;
    }
    }
  }

  destroy() {
    window.removeEventListener('message', this.onWindowMessage);
  }

  protected selectionChanged() {
    super.selectionChanged();
    return this.sendInputSelectionMessage();
  }

  protected itemSelectionChanged() {
    super.itemSelectionChanged();
    return this.sendItemSelectionMessage();
  }

  protected parameterChanged(name: string) {
    return this.sendParameterMessage(name);
  }


  private sendInputSelectionMessage() {
    if (!this.iframeWindow) {
      return;
    }

    return this.resolveSelection().then((ids) => {
      if (!ids || ids.length === 0) {
        this.setNoMappingFoundHint(true);
        return;
      }
      this.setNoMappingFoundHint(false);
      this.sendMessage({ type: 'tdpSetInputSelection', payload: {
        idType: this.idType.id,
        ids
      }});
    });
  }

  private sendMessage(msg: ITDPMessage) {
    if (!this.iframeWindow) {
      return;
    }
    const url = new URL(this.options.site);
    this.iframeWindow.postMessage(msg, url.origin);
  }

  private sendItemSelectionMessage() {
    if (!this.iframeWindow) {
      return;
    }

    const s = this.getItemSelection();
    if (!s || s.range.isNone) {
      this.sendMessage({ type: 'tdpSetItemSelection', payload: {
        idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
        ids: []
      }});
      return;
    }

    return resolveIds(s.idtype, s.range, this.itemIDType).then((ids) => {
      this.sendMessage({ type: 'tdpSetItemSelection', payload: {
        idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
        ids
      }});
    });
  }

  private sendParameterMessage(name: string) {
    if (!this.iframeWindow) {
      return;
    }

    const value = this.getParameter(name);
    this.sendMessage({ type: 'tdpSetParameter', payload: {
      name,
      value
    }});
  }

  private static isNoNSecurePage(url: string) {
    const self = location.protocol.toLowerCase();
    if (!self.startsWith('https')) {
      return false; // if I'm not secure doesn't matter
    }
    return url.startsWith('http://');
  }

  private showNoHttpsMessage(url: string) {
    this.setBusy(false);
    this.node.innerHTML = `
        <p><div class="alert alert-info center-block" role="alert" style="max-width: 40em"><strong>Security Information: </strong>This website uses HTTPS to secure your communication with our server.
            However, the requested external website doesn't support HTTPS and thus cannot be directly embedded in this application.
            Please use the following <a href="${url}" target="_blank" class="alert-link">link</a> to open the website in a separate window:
            <br><br><a href="${url}" target="_blank" class="alert-link">${url}</a>
        </div></p><p></p>`;
    this.fire(MessagingProxyView.EVENT_LOADING_FINISHED);
  }
}
