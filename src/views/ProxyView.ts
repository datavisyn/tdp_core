/**
 * Created by Holger Stitz on 07.09.2016.
 */

import {mixin} from 'phovea_core/src';
import {resolve} from 'phovea_core/src/idtype';
import {IViewContext, ISelection} from './interfaces';
import {FormElementType, IFormSelectElement, IFormSelectOption} from '../form';
import AD3View from './AD3View';
import {getProxyUrl} from '../rest';

export const FORM_ID_SELECTED_ITEM = 'externalItem';

export interface IProxyViewOptions {
  proxy?: string;
  site?: string;
  argument: string;
  idtype?: string;
  extra: object;
  openExternally: boolean;
}

/**
 * helper view for proxying an existing external website using an iframe
 */
export default class ProxyView extends AD3View {
  protected options: IProxyViewOptions = {
    /**
     * proxy key - will be redirected through a local server proxy
     */
    proxy: null,
    /**
     * direct loading of an iframe site
     */
    site: null,
    /**
     * within the url {argument} will be replaced with the current selected id
     */
    argument: 'gene',
    /**
     * idtype of the argument
     */
    idtype: null,
    extra: {},
    openExternally: false
  };

  private readonly openExternally: HTMLElement;

  readonly naturalSize = [1280, 800];

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IProxyViewOptions> = {}) {
    super(context, selection, parent);
    mixin(this.options, context.desc, options);
    this.$node.classed('proxy_view', true);

    this.openExternally = parent.ownerDocument.createElement('p');
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    super.init(params, onParameterChange);

    // inject stats
    const base = <HTMLElement>params.querySelector('form') || params;
    base.insertAdjacentHTML('beforeend', `<div class="form-group"></div>`);
    base.lastElementChild!.appendChild(this.openExternally);
  }

  protected initImpl() {
    super.initImpl();
    // update the selection first, then update the proxy view
    return this.updateSelectedItemSelect()
      .then(() => {
        this.updateProxyView();
      });
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

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([{
      type: FormElementType.SELECT,
      label: 'Show',
      id: FORM_ID_SELECTED_ITEM,
      options: {
        optionsData: [],
      },
      useSession: true
    }]);
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    this.updateProxyView();
  }

  protected selectionChanged() {
    super.selectionChanged();
    // update the selection first, then update the proxy view
    this.updateSelectedItemSelect(true) // true = force use last selection
      .then(() => {
        this.updateProxyView();
      });
  }

  protected updateSelectedItemSelect(forceUseLastSelection = false) {
    return this.resolveSelection()
      .then((names) => Promise.all<any>([names, this.getSelectionSelectData(names)]))
      .then((args: any[]) => {
        const names = <string[]>args[0]; // use names to get the last selected element
        const data = <{ value: string, name: string, data: any }[]>args[1];
        const selectedItemSelect: IFormSelectElement = <IFormSelectElement>this.getParameterElement(FORM_ID_SELECTED_ITEM);

        // backup entry and restore the selectedIndex by value afterwards again,
        // because the position of the selected element might change
        const bak = selectedItemSelect.value || data[selectedItemSelect.getSelectedIndex()];
        selectedItemSelect.updateOptionElements(data);

        // select last item from incoming `selection.range`
        if (forceUseLastSelection) {
          selectedItemSelect.value = data.filter((d) => d.value === names[names.length - 1])[0];

          // otherwise try to restore the backup
        } else if (bak !== null) {
          selectedItemSelect.value = bak;
        }

        // just show if there is more than one
        selectedItemSelect.setVisible(data.length > 1);
      });
  }

  protected getSelectionSelectData(names: string[]): Promise<IFormSelectOption[]> {
    if (names === null) {
      return Promise.resolve([]);
    }

    // hook
    return Promise.resolve(names.map((d) => ({value: d, name: d, data: d})));
  }

  protected updateProxyView() {
    this.loadProxyPage(this.getParameter(FORM_ID_SELECTED_ITEM).value);
  }

  protected loadProxyPage(selectedItemId: string) {
    if (selectedItemId === null) {
      this.showErrorMessage(selectedItemId);
      return;
    }

    //remove old mapping error notice if any exists
    this.openExternally.innerHTML = '';
    this.$node.selectAll('p').remove();
    this.$node.selectAll('iframe').remove();

    this.setBusy(true);

    const args = mixin(this.options.extra, {[this.options.argument]: selectedItemId});
    const url = this.createUrl(args);

    if (ProxyView.isNoNSecurePage(url)) {
      this.showNoHttpsMessage(url);
      return;
    }

    if (this.options.openExternally) {
      this.setBusy(false);
      this.node.innerHTML = `<p><div class="alert alert-info center-block" role="alert" style="max-width: 40em">
      Please <a href="${url}" class="alert-link" target="_blank" rel="noopener">click here
      to open the external application</a> in a new browser tab.</div></p>`;
      return;
    }

    this.openExternally.innerHTML = `The web page below is directly loaded from <a href="${url}" target="_blank"><i class="fa fa-external-link"></i>${url.startsWith('http') ? url: `${location.protocol}${url}`}</a>`;

    //console.log('start loading', this.$node.select('iframe').node().getBoundingClientRect());
    this.$node.append('iframe')
      .attr('src', url)
      .on('load', () => {
        this.setBusy(false);
        //console.log('finished loading', this.$node.select('iframe').node().getBoundingClientRect());
        this.fire(ProxyView.EVENT_LOADING_FINISHED);
      });
  }

  protected showErrorMessage(selectedItemId: string) {
    this.setBusy(false);
    const to = this.options.idtype ? resolve(this.options.idtype).name : 'Unknown';
    this.$node.html(`<p>Cannot map <i>${this.selection.idtype.name}</i> ('${selectedItemId}') to <i>${to}</i>.</p>`);
    this.openExternally.innerHTML = ``;
    this.fire(ProxyView.EVENT_LOADING_FINISHED);
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
    this.$node.html(`
        <p><div class="alert alert-info center-block" role="alert" style="max-width: 40em"><strong>Security Information: </strong>This website uses HTTPS to secure your communication with our server.
            However, the requested external website doesn't support HTTPS and thus cannot be directly embedded in this application.
            Please use the following <a href="${url}" target="_blank" class="alert-link">link</a> to open the website in a separate window:
            <br><br><a href="${url}" target="_blank" class="alert-link">${url}</a>
        </div></p><p></p>`);
    this.openExternally.innerHTML = ``;
    this.fire(ProxyView.EVENT_LOADING_FINISHED);
  }
}


export function create(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IProxyViewOptions> = {}) {
  return new ProxyView(context, selection, parent, options);
}
