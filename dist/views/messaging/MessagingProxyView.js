import { AView } from '../AView';
import { ResolveUtils } from '../ResolveUtils';
import { IDTypeManager } from '../../idtype';
import { ParseRangeUtils, Range } from '../../range';
import { I18nextManager } from '../../i18n';
export class MessagingProxyView extends AView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        this.options = {
            site: null,
            idtype: null,
            itemIDType: null,
        };
        this.naturalSize = [1280, 800];
        this.iframeWindow = null;
        this.messageQueue = [];
        this.onWindowMessage = (evt) => {
            if (!this.iframeWindow || evt.source !== this.iframeWindow || !evt.data || typeof evt.data.type !== 'string' || !evt.data.payload) {
                return;
            }
            const msg = evt.data;
            switch (msg.type) {
                case 'tdpSetItemSelection': {
                    const { payload } = msg;
                    const name = payload.name || AView.DEFAULT_SELECTION_NAME;
                    const { ids } = payload;
                    const idType = payload.idType ? IDTypeManager.getInstance().resolveIdType(payload.idType) : this.itemIDType;
                    if (!ids || ids.length === 0) {
                        this.setItemSelection({ idtype: idType, range: Range.none() }, name);
                    }
                    if (!idType) {
                        console.warn('cannot set item selection since of unknown idType');
                        return;
                    }
                    idType.map(ids).then((r) => {
                        this.setItemSelection({ idtype: idType, range: ParseRangeUtils.parseRangeLike(r) }, name);
                    });
                    return;
                }
                case 'tdpSetParameter': {
                    const { payload } = msg;
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
        Object.assign(this.options, context.desc, options);
    }
    get itemIDType() {
        if (!this.options.itemIDType) {
            return null;
        }
        return IDTypeManager.getInstance().resolveIdType(this.options.itemIDType);
    }
    initImpl() {
        super.initImpl();
        this.node.classList.add('proxy_view');
        return this.build();
    }
    build() {
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
    destroy() {
        window.removeEventListener('message', this.onWindowMessage);
    }
    selectionChanged(name = AView.DEFAULT_SELECTION_NAME) {
        super.selectionChanged(name);
        return this.sendInputSelectionMessage(name);
    }
    itemSelectionChanged(name = AView.DEFAULT_SELECTION_NAME) {
        super.itemSelectionChanged(name);
        return this.sendItemSelectionMessage(name);
    }
    parameterChanged(name) {
        return this.sendParameterMessage(name);
    }
    sendInputSelectionMessage(name) {
        if (!this.iframeWindow) {
            return;
        }
        const selection = this.getInputSelection(name);
        ResolveUtils.resolveIds(selection.idtype, selection.range).then((ids) => {
            if (!ids || ids.length === 0) {
                this.setNoMappingFoundHint(true);
                return;
            }
            this.setNoMappingFoundHint(false);
            this.sendMessage({
                type: 'tdpSetInputSelection',
                payload: {
                    name,
                    idType: this.idType.id,
                    ids,
                },
            });
        });
    }
    sendMessage(msg, queueIfNotExisting = false) {
        if (!this.iframeWindow) {
            if (queueIfNotExisting) {
                this.messageQueue.push(msg);
            }
            return;
        }
        const url = new URL(this.options.site);
        this.iframeWindow.postMessage(msg, url.origin);
    }
    sendItemSelectionMessage(name) {
        const s = this.getItemSelection(name);
        if (!s || s.range.isNone) {
            this.sendMessage({
                type: 'tdpSetItemSelection',
                payload: {
                    name,
                    idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
                    ids: [],
                },
            }, true);
            return;
        }
        ResolveUtils.resolveIds(s.idtype, s.range, this.itemIDType).then((ids) => {
            this.sendMessage({
                type: 'tdpSetItemSelection',
                payload: {
                    name,
                    idType: this.itemIDType ? this.itemIDType.id : s.idtype.id,
                    ids,
                },
            }, true);
        });
    }
    sendParameterMessage(name) {
        if (!this.iframeWindow) {
            return;
        }
        const value = this.getParameter(name);
        this.sendMessage({
            type: 'tdpSetParameter',
            payload: {
                name,
                value,
            },
        }, true);
    }
    static isNoNSecurePage(url) {
        const self = window.location.protocol.toLowerCase();
        if (!self.startsWith('https')) {
            return false; // if I'm not secure doesn't matter
        }
        return url.startsWith('http://');
    }
    showNoHttpsMessage(url) {
        this.setBusy(false);
        this.node.innerHTML = `
    <div class="alert alert-info mx-auto" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.proxyPageCannotBeShownHere')}
    <a href="${url}" target="_blank" rel="noopener" class="alert-link">${url}</a>
    </div>`;
        this.fire(MessagingProxyView.EVENT_LOADING_FINISHED);
    }
}
//# sourceMappingURL=MessagingProxyView.js.map