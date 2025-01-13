import { I18nextManager } from 'visyn_core/i18n';

import { AView } from './AView';
import { ISelectionChooserOptions, SelectionChooser } from './SelectionChooser';
import { ISelection, IViewContext } from '../base/interfaces';
import { RestBaseUtils } from '../base/rest';

export interface IProxyViewChooserOptions extends Partial<ISelectionChooserOptions> {
  /**
   * site name
   */
  name: string;
  /**
   * proxy key - will be redirected through a local server proxy
   */
  proxy: string;
  /**
   * direct loading of an iframe site
   */
  site: string;
  /**
   * within the url {argument} will be replaced with the current selected id
   * @default gene
   */
  argument: string;
  /**
   * idtype of the argument
   */
  idtype: string;
  /**
   * extra object for the link generation
   */
  extra: object;
  /**
   * flag whether just an open externally link should be shown,
   * i.e. in case iframe is prohibited
   * @default false
   */
  openExternally: boolean;
}

export class ChooserProxyView extends AView {
  protected options: IProxyViewChooserOptions = {
    name: null,
    proxy: null,
    site: null,
    argument: 'gene',
    idtype: null,
    extra: {},
    openExternally: false,
  };

  protected readonly chooser: SelectionChooser;

  private readonly openExternally: HTMLElement;

  readonly naturalSize = [1280, 800];

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IProxyViewChooserOptions> = {}) {
    super(context, selection, parent);
    Object.assign(this.options, context.desc, options);
    this.chooser = new SelectionChooser((id) => this.getParameterElement(id), this.options.idtype, this.options);

    this.openExternally = parent.ownerDocument.createElement('p');
  }

  async init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    const initResult = await super.init(params, onParameterChange);

    // inject stats
    const base = <HTMLElement>params.querySelector('form') || params;
    base.insertAdjacentHTML('beforeend', `<div class="col-sm-auto"></div>`);
    base.lastElementChild!.appendChild(this.openExternally);

    return initResult;
  }

  protected initImpl() {
    super.initImpl();

    this.node.classList.add('proxy_view');

    return this.chooser.init(this.selection).then(() => {
      return this.build();
    });
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([this.chooser.desc]);
  }

  protected selectionChanged() {
    super.selectionChanged();
    return this.chooser.update(this.selection).then(() => this.build());
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    return this.build();
  }

  protected createUrl(args: any) {
    // use internal proxy
    if (this.options.proxy) {
      return RestBaseUtils.getProxyUrl(this.options.proxy, args);
    }
    if (this.options.site) {
      return this.options.site.replace(/{([^}]+)}/gi, (match, variable) => args[variable]);
    }
    return null;
  }

  protected build() {
    // remove old mapping error notice if any exists
    this.openExternally.innerHTML = '';
    this.node.innerHTML = '';
    this.setHint(false);
    this.setNoMappingFoundHint(false);

    const selectedItemId = this.chooser.chosen();
    if (selectedItemId == null) {
      const to = this.options.idtype ? I18nextManager.getInstance().i18n.t('tdp:core.views.toOption', { id: this.options.idtype }) : '';
      this.setNoMappingFoundHint(true, I18nextManager.getInstance().i18n.t('tdp:core.views.noMappingFound', { name: to }));
      return;
    }

    this.setBusy(true);

    const args = { ...this.options.extra, [this.options.argument]: selectedItemId.name };
    const url = this.createUrl(args);

    if (ChooserProxyView.isNoNSecurePage(url)) {
      this.showNoHttpsMessage(url);
      return;
    }

    if (this.options.openExternally) {
      this.setBusy(false);
      this.node.innerHTML = `<div class="alert alert-info mx-auto" role="alert">${I18nextManager.getInstance().i18n.t(
        'tdp:core.views.proxyPageCannotBeShownHere',
      )}
      <a href="${url}" target="_blank" rel="noopener" class="alert-link">${url}</a>
      </div>`;
      return;
    }

    this.openExternally.innerHTML = `${I18nextManager.getInstance().i18n.t(
      'tdp:core.views.isLoaded',
    )} <a href="${url}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i>${
      url.startsWith('http') ? url : `${window.location.protocol}${url}`
    }</a>`;

    const iframe = this.node.ownerDocument.createElement('iframe');
    iframe.src = url;
    iframe.onload = () => {
      this.setBusy(false);
      this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
    };
    this.node.appendChild(iframe);
  }

  protected showErrorMessage() {
    this.setBusy(false);
    this.node.innerHTML = `<p>${I18nextManager.getInstance().i18n.t('tdp:core.views.screwed')}</p>`;
    this.openExternally.innerHTML = ``;
    this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
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
    this.openExternally.innerHTML = ``;
    this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
  }
}
