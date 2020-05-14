import AView from '../AView';
import {IViewContext, ISelection} from '../interfaces';
import {resolve} from 'phovea_core/src/idtype';
import {resolveIds} from '../resolve';
import {parse, none} from 'phovea_core/src/range';
import {ITDPMessage, ITDPSetItemSelectionMessage, ITDPSetParameterMessage} from './interfaces';
import {DEFAULT_SELECTION_NAME} from '../../extensions';
import i18n from 'phovea_core/src/i18n';

export interface IPartialProxyViewOptions {
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
  protected options: IPartialProxyViewOptions = {
    site: null,
    idtype: null,
    itemIDType: null
  };

  readonly naturalSize = [1280, 800];

  private iframeWindow: Window | null = null;
  private messageQueue: ITDPMessage[] = [];

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IPartialProxyViewOptions> = {}) {
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
      this.sendInputSelectionMessage(DEFAULT_SELECTION_NAME);

      // send queued messages
      this.messageQueue.splice(0, this.messageQueue.length).forEach((msg) => this.sendMessage(msg));
    };
    iframe.src = this.options.site;
    // listen on iframe events
    window.addEventListener('message', this.onWindowMessage, {
      passive: true
    });

    this.node.appendChild(iframe);
  }

  private onWindowMessage = (evt: MessageEvent) => {
    if (!this.iframeWindow || evt.source !== this.iframeWindow || !evt.data || (typeof evt.data.type !== 'string') || !evt.data.payload) {
      return;
    }
    const msg = <ITDPMessage>evt.data;
    switch (msg.type) {
      case 'tdpSetItemSelection': {
        const payload = (<ITDPSetItemSelectionMessage>msg).payload;
        const name = payload.name || DEFAULT_SELECTION_NAME;
        const ids: string[] = payload.ids;
        const idType = payload.idType ? resolve(payload.idType) : this.itemIDType;
        if (!ids || ids.length === 0) {
          this.setItemSelection({idtype: idType, range: none()}, name);
        }

        if (!idType) {
          console.warn('cannot set item selection since of unknown idType');
          return;
        }
        idType.map(ids).then((r) => {
          this.setItemSelection({idtype: idType, range: parse(r)}, name);
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

  protected selectionChanged(name: string = DEFAULT_SELECTION_NAME) {
    super.selectionChanged(name);
    return this.sendInputSelectionMessage(name);
  }

  protected itemSelectionChanged(name: string = DEFAULT_SELECTION_NAME) {
    super.itemSelectionChanged(name);
    return this.sendItemSelectionMessage(name);
  }

  protected parameterChanged(name: string) {
    return this.sendParameterMessage(name);
  }


  private sendInputSelectionMessage(name: string) {
    if (!this.iframeWindow) {
      return;
    }

    const selection = this.getInputSelection(name);
    return resolveIds(selection.idtype, selection.range).then((ids) => {
      if (!ids || ids.length === 0) {
        this.setNoMappingFoundHint(true);
        return;
      }
      this.setNoMappingFoundHint(false);
      this.sendMessage({
        type: 'tdpSetInputSelection', payload: {
          name,
          idType: this.idType.id,
          ids
        }
      });
    });
  }

  private sendMessage(msg: ITDPMessage, queueIfNotExisting = false) {
    if (!this.iframeWindow) {
      if (queueIfNotExisting) {
        this.messageQueue.push(msg);
      }
      return;
    }
    const url = new URL(this.options.site);
    this.iframeWindow.postMessage(msg, url.origin);
  }

  private sendItemSelectionMessage(name: string) {
    const s = this.getItemSelection(name);
    if (!s || s.range.isNone) {
      this.sendMessage({
        type: 'tdpSetItemSelection', payload: {
          name,
          idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
          ids: []
        }
      }, true);
      return;
    }

    return resolveIds(s.idtype, s.range, this.itemIDType).then((ids) => {
      this.sendMessage({
        type: 'tdpSetItemSelection', payload: {
          name,
          idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
          ids
        }
      }, true);
    });
  }

  private sendParameterMessage(name: string) {
    if (!this.iframeWindow) {
      return;
    }

    const value = this.getParameter(name);
    this.sendMessage({
      type: 'tdpSetParameter', payload: {
        name,
        value
      }
    }, true);
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
    <p><div class="alert alert-info center-block" role="alert" style="max-width: 40em">${i18n.t('tdp:core.views.noHttpsMessagePart1')}
    <a href="${url}" target="_blank" rel="noopener" class="alert-link">${i18n.t('tdp:core.views.link')}</a> ${i18n.t('tdp:core.views.noHttpsMessagePart2')}
       <br><br><a href="${url}" target="_blank" rel="noopener" class="alert-link"></a>
   </div></p><p></p>`;
    this.fire(MessagingProxyView.EVENT_LOADING_FINISHED);
  }
}
