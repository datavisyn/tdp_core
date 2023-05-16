import { IDTypeManager } from 'visyn_core/idtype';
import { I18nextManager } from 'visyn_core/i18n';
import { AView } from '../AView';
import { IViewContext, ISelection } from '../../base/interfaces';
import { ITDPMessage, ITDPSetItemSelectionMessage, ITDPSetParameterMessage } from './interfaces';

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

export class MessagingProxyView extends AView {
  protected options: IPartialProxyViewOptions = {
    site: null,
    idtype: null,
    itemIDType: null,
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
    return IDTypeManager.getInstance().resolveIdType(this.options.itemIDType);
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
      this.sendInputSelectionMessage(AView.DEFAULT_SELECTION_NAME);

      // send queued messages
      this.messageQueue.splice(0, this.messageQueue.length).forEach((msg) => this.sendMessage(msg));
    };
    iframe.src = this.options.site;
    // listen on iframe events
    window.addEventListener('message', this.onWindowMessage, {
      passive: true,
    });

    this.node.appendChild(iframe);
  }

  private onWindowMessage = (evt: MessageEvent) => {
    if (!this.iframeWindow || evt.source !== this.iframeWindow || !evt.data || typeof evt.data.type !== 'string' || !evt.data.payload) {
      return;
    }
    const msg = <ITDPMessage>evt.data;
    switch (msg.type) {
      case 'tdpSetItemSelection': {
        const { payload } = <ITDPSetItemSelectionMessage>msg;
        const name = payload.name || AView.DEFAULT_SELECTION_NAME;
        const { ids } = payload;
        const idType = payload.idType ? IDTypeManager.getInstance().resolveIdType(payload.idType) : this.itemIDType;
        if (!ids || ids.length === 0) {
          this.setItemSelection({ idtype: idType, ids: [] }, name);
        }

        if (!idType) {
          console.warn('cannot set item selection since of unknown idType');
          return;
        }
        this.setItemSelection({ idtype: idType, ids }, name);
        return;
      }
      case 'tdpSetParameter': {
        const { payload } = <ITDPSetParameterMessage>msg;
        const { name } = payload;
        const value = payload.value == null ? null : payload.value;
        if (!name) {
          console.warn('cannot set item parameter with no name');
          return;
        }
        this.changeParameter(name, value);
        break;
      }
      default:
        break;
    }
  };

  destroy() {
    window.removeEventListener('message', this.onWindowMessage);
  }

  protected selectionChanged(name: string = AView.DEFAULT_SELECTION_NAME) {
    super.selectionChanged(name);
    return this.sendInputSelectionMessage(name);
  }

  protected itemSelectionChanged(name: string = AView.DEFAULT_SELECTION_NAME) {
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
    if (!selection.ids || selection.ids.length === 0) {
      this.setNoMappingFoundHint(true);
      return;
    }
    this.setNoMappingFoundHint(false);
    this.sendMessage({
      type: 'tdpSetInputSelection',
      payload: {
        name,
        idType: this.idType.id,
        ids: selection.ids,
      },
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
    if (!s || s.ids.length === 0) {
      this.sendMessage(
        {
          type: 'tdpSetItemSelection',
          payload: {
            name,
            idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
            ids: [],
          },
        },
        true,
      );
      return undefined;
    }

    return IDTypeManager.getInstance()
      .mapNameToFirstName(s.idtype, s.ids, this.itemIDType)
      .then((ids) => {
        this.sendMessage(
          {
            type: 'tdpSetItemSelection',
            payload: {
              name,
              idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
              ids,
            },
          },
          true,
        );
      });
  }

  private sendParameterMessage(name: string) {
    if (!this.iframeWindow) {
      return;
    }

    const value = this.getParameter(name);
    this.sendMessage(
      {
        type: 'tdpSetParameter',
        payload: {
          name,
          value,
        },
      },
      true,
    );
  }

  private static isNoNSecurePage(url: string) {
    const self = window.location.protocol.toLowerCase();
    if (!self.startsWith('https')) {
      return false; // if I'm not secure doesn't matter
    }
    return url.startsWith('http://');
  }

  private showNoHttpsMessage(url: string) {
    this.setBusy(false);
    this.node.innerHTML = `
    <div class="alert alert-info mx-auto" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.proxyPageCannotBeShownHere')}
    <a href="${url}" target="_blank" rel="noopener" class="alert-link">${url}</a>
    </div>`;
    this.fire(MessagingProxyView.EVENT_LOADING_FINISHED);
  }
}
