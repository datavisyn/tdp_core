import AView from './AView';
import {IViewContext, ISelection} from './interfaces';
import {getProxyUrl} from '../rest';
import SelectionChooser, {ISelectionChooserOptions} from './SelectionChooser';
import i18n from 'phovea_core/src/i18n';

export interface IProxyViewOptions extends Partial<ISelectionChooserOptions> {
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

export default class ChooserProxyView extends AView {
  protected options: IProxyViewOptions = {
    name: null,
    proxy: null,
    site: null,
    argument: 'gene',
    idtype: null,
    extra: {},
    openExternally: false
  };

  protected readonly chooser: SelectionChooser;
  private readonly openExternally: HTMLElement;

  readonly naturalSize = [1280, 800];

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IProxyViewOptions> = {}) {
    super(context, selection, parent);
    Object.assign(this.options, context.desc, options);
    this.chooser = new SelectionChooser((id) => this.getParameterElement(id), this.options.idtype, this.options);

    this.openExternally = parent.ownerDocument.createElement('p');
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    const p = super.init(params, onParameterChange);

    // inject stats
    const base = <HTMLElement>params.querySelector('form') || params;
    base.insertAdjacentHTML('beforeend', `<div class="form-group"></div>`);
    base.lastElementChild!.appendChild(this.openExternally);

    return p;
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
    //use internal proxy
    if (this.options.proxy) {
      return getProxyUrl(this.options.proxy, args);
    }
    if (this.options.site) {
      return this.options.site.replace(/{([^}]+)}/gi, (match, variable) => args[variable]);
    }
    return null;
  }

  protected build() {
    //remove old mapping error notice if any exists
    this.openExternally.innerHTML = '';
    this.node.innerHTML = '';
    this.setHint(false);
    this.setNoMappingFoundHint(false);

    const selectedItemId = this.chooser.chosen();
    if (selectedItemId == null) {
      const to = this.options.idtype ? i18n.t('tdp:core.views.toOption', {id: this.options.idtype}) : '';
      this.setNoMappingFoundHint(true, i18n.t('tdp:core.views.noMappingFound', {name: to}));
      return;
    }

    this.setBusy(true);

    const args = Object.assign({}, this.options.extra, {[this.options.argument]: selectedItemId.name});
    const url = this.createUrl(args);

    if (ChooserProxyView.isNoNSecurePage(url)) {
      this.showNoHttpsMessage(url);
      return;
    }

    if (this.options.openExternally) {
      this.setBusy(false);
      this.node.innerHTML = `<p><div class="alert alert-info center-block" role="alert" style="max-width: 40em">
     ${i18n.t('tdp:core.views.please')} <a href="${url}" class="alert-link" target="_blank" rel="noopener">${i18n.t('tdp:core.views.openExternally', {name: this.options.name ? this.options.name : '$t(tdp:core.views.externalApplication)'})}</a>
     ${i18n.t('tdp:core.views.newTab')}</div></p>`;
      return;
    }

    this.openExternally.innerHTML = `${i18n.t('tdp:core.views.isLoaded')} <a href="${url}" target="_blank" rel="noopener"><i class="fa fa-external-link"></i>${url.startsWith('http') ? url : `${location.protocol}${url}`}</a>`;

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
    this.node.innerHTML = `<p>${i18n.t('tdp:core.views.screwed')}</p>`;
    this.openExternally.innerHTML = ``;
    this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
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
    this.openExternally.innerHTML = ``;
    this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
  }
}
