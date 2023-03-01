import { select } from 'd3v3';
import { IDType, IDTypeManager, SelectionUtils } from 'visyn_core';
import { I18nextManager } from 'visyn_core';
import { EventHandler, WebpackEnv } from 'visyn_core';
import { IFormElementDesc, IForm } from '../form/interfaces';
import { FormBuilder } from '../form/FormBuilder';
import { AFormElement } from '../form/elements/AFormElement';
import { ISelection, IView, IViewContext, EViewMode } from '../base/interfaces';
import { ViewUtils } from './ViewUtils';
import { ERenderAuthorizationStatus, IAuthorizationConfiguration, TokenManager, TDPTokenManager } from '../auth';

/**
 * base class for all views
 */
export abstract class AView extends EventHandler implements IView {
  public static readonly DEFAULT_SELECTION_NAME = 'default';

  /**
   * params(oldValue: ISelection, newSelection: ISelection)
   */
  static readonly EVENT_ITEM_SELECT = ViewUtils.VIEW_EVENT_ITEM_SELECT;

  /**
   * params(namedSet: INamedSet)
   */
  static readonly EVENT_UPDATE_ENTRY_POINT = ViewUtils.VIEW_EVENT_UPDATE_ENTRY_POINT;

  /**
   * params()
   */
  static readonly EVENT_LOADING_FINISHED = ViewUtils.VIEW_EVENT_LOADING_FINISHED;

  /**
   * params(name: string, oldValue: any, newValue: any)
   */
  static readonly EVENT_UPDATE_SHARED = ViewUtils.VIEW_EVENT_UPDATE_SHARED;

  readonly idType: IDType;

  readonly node: HTMLElement;

  private params: IForm;

  private readonly paramsFallback = new Map<string, any>();

  private readonly shared = new Map<string, any>();

  private paramsChangeListener: (name: string, value: any, previousValue: any) => Promise<any>;

  private readonly itemSelections = new Map<string, ISelection>();

  private readonly selections = new Map<string, ISelection>();

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement) {
    super();
    this.selections.set(AView.DEFAULT_SELECTION_NAME, selection);
    this.itemSelections.set(AView.DEFAULT_SELECTION_NAME, { idtype: null, ids: [] });

    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tdp-view');
    parent.appendChild(this.node);
    if (this.isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = IDTypeManager.getInstance().resolveIdType(context.desc.idtype);
    }
  }

  /**
   * helper to marks this view busy showing a loading icon
   * @param {boolean} value
   * @param {boolean|string} busyMessage optional loading message hint
   */
  protected setBusy(value: boolean, busyMessage?: string | boolean) {
    this.node.classList.toggle('tdp-busy', value);
    if (!value || !busyMessage) {
      delete this.node.dataset.busy;
    } else if (busyMessage) {
      this.node.dataset.busy = typeof busyMessage === 'string' ? busyMessage : I18nextManager.getInstance().i18n.t('tdp:core.views.busyMessage');
    }
  }

  protected setHint(visible: boolean, hintMessage?: string, hintCSSClass = 'hint') {
    const conditionalData = this.selection.idtype ? { name: this.selection.idtype.name } : { context: 'unknown' };
    const defaultHintMessage = I18nextManager.getInstance().i18n.t('tdp:core.views.defaultHint', { ...conditionalData });
    this.node.classList.toggle(`tdp-${hintCSSClass}`, visible);
    if (!visible) {
      delete this.node.dataset.hint;
    } else {
      this.node.dataset.hint = hintMessage || defaultHintMessage;
    }
  }

  protected setNoMappingFoundHint(visible: boolean, hintMessage?: string) {
    const conditionalData = {
      ...(this.selection.idtype ? { name: this.selection.idtype.name } : { context: 'unknown' }),
      id: this.idType ? this.idType.name : '',
    };
    return this.setHint(
      visible,
      hintMessage || I18nextManager.getInstance().i18n.t('tdp:core.views.noMappingFoundHint', { ...conditionalData }),
      'hint-mapping',
    );
  }

  /* final */
  async init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<any> {
    TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_REMOVED, async () => {
      // If a authorization is removed, rerun the registered authorizations
      await this.runAuthorizations();
    });
    // First, run all required authorizations
    await this.runAuthorizations();

    // Register listener after the authorizations are run to avoid double-initializations
    TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_STORED, async (_, id, token) => {
      // TODO: Enabling this leads to the taggle view being loaded twice
      // await this.initImpl();
    });

    this.params = await this.buildParameterForm(params, onParameterChange);
    return this.initImpl();
  }

  /**
   * Uses the token manager to run the authorizations defined by `getAuthorizationConfiguration()`.
   * Only authorizations which are not yet stored in the token manager are run, others are skipped.
   * It will show an overlay over the detail view allowing the user to authorize the application.
   */
  protected async runAuthorizations(): Promise<void> {
    await TDPTokenManager.runAuthorizations(await this.getAuthorizationConfiguration(), {
      render: ({ authConfiguration, status, error, trigger }) => {
        // Fetch or create the authorization overlay
        let overlay = this.node.querySelector<HTMLDivElement>('.tdp-authorization-overlay');
        if (!overlay) {
          overlay = this.node.ownerDocument.createElement('div');
          overlay.className = 'tdp-authorization-overlay';
          // Add element at the very bottom to avoid using z-index
          this.node.appendChild(overlay);
        }

        if (status === ERenderAuthorizationStatus.SUCCESS) {
          overlay.remove();
        } else {
          overlay.innerHTML = `
          ${
            error
              ? `<div class="alert alert-info" role="alert">${I18nextManager.getInstance().i18n.t(
                  'tdp:core.views.authorizationFailed',
                )} ${error.toString()}</div>`
              : ''
          }
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <p class="lead">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationRequired', { name: authConfiguration.name })}</p>
                <button class="btn btn-primary" ${status === 'pending' ? `disabled` : ''}>${
            status === 'pending'
              ? I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButtonLoading')
              : I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButton')
          }</button>
            </div>`;

          overlay.querySelector('button').onclick = async () => {
            trigger();
          };
        }
      },
    });
  }

  /**
   * Hook to override returning which authorizations are required for this view.
   * @returns ID(s) or authorization configurations(s) which are required. Defaults to the `authorization` desc entry.
   */
  protected async getAuthorizationConfiguration(): Promise<string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null> {
    // hook
    return this.context.desc.authorization;
  }

  /**
   * hook for custom initialization
   */
  protected initImpl() {
    // hook
    return null;
  }

  private buildParameterForm(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<IForm> {
    const builder = new FormBuilder(select(params), undefined, true);

    // work on a local copy since we change it by adding an onChange handler
    const descs = this.getParameterFormDescs().map((d) => ({ ...d }));

    const onInit: (name: string, value: any, previousValue: any, isInitialzation: boolean) => void = <any>onParameterChange;

    // map FormElement change function to provenance graph onChange function
    descs.forEach((p) => {
      p.onChange = (formElement, value, _data, previousValue) => onParameterChange(formElement.id, value, previousValue);

      if (onInit) {
        p.onInit = (formElement, value, _data, previousValue) => onInit(formElement.id, value, previousValue, true);
      }
    });
    this.paramsChangeListener = onParameterChange;

    builder.appendElements(descs);

    return builder.build();
  }

  /**
   * return a list of FormBuilder element descriptions to build the parameter form
   * @returns {IFormElementDesc[]}
   */
  protected getParameterFormDescs(): IFormElementDesc[] {
    // hook
    return [];
  }

  getItemSelectionNames() {
    return Array.from(this.itemSelections.keys());
  }

  /**
   * finds the element form element based on the given id
   * @param {string} id
   * @returns {IFormElement}
   */
  protected getParameterElement(id: string) {
    return this.params.getElementById(id);
  }

  /**
   * returns the value of the given parameter
   */

  /* final */
  getParameter(name: string): any {
    const elem = this.getParameterElement(name);
    if (!elem) {
      if (WebpackEnv.__DEBUG__ && this.params.length > 0) {
        console.warn('invalid parameter detected use fallback', name, this.context.desc);
      }
      return this.paramsFallback.has(name) ? this.paramsFallback.get(name) : null;
    }
    const v = elem.value;

    return v === null ? '' : v;
  }

  protected getParameterData(name: string): any {
    const value = this.getParameter(name);
    return AFormElement.toData(value);
  }

  protected async changeParameter(name: string, value: any) {
    const old = this.getParameter(name);
    if (old === value) {
      return;
    }
    await this.paramsChangeListener(name, value, old);
    await this.setParameter(name, value);
  }

  /* final */
  setParameter(name: string, value: any) {
    const elem = this.getParameterElement(name);
    if (!elem) {
      if (WebpackEnv.__DEBUG__ && this.params.length > 0) {
        console.warn('invalid parameter detected use fallback', name, this.context.desc);
      }
      this.paramsFallback.set(name, value);
    } else {
      elem.value = value;
    }
    return this.parameterChanged(name);
  }

  updateShared(name: string, value: any) {
    if (this.shared.has(name) && this.shared.get(name) === value) {
      return;
    }
    const old = this.shared.get(name);
    this.shared.set(name, value);
    this.sharedChanged(name);
    this.fire(AView.EVENT_UPDATE_SHARED, name, old, value);
  }

  protected sharedChanged(_name: string) {
    // hook
  }

  protected getShared(name: string) {
    return this.shared.get(name);
  }

  /**
   * hook triggerd when the parameter has changed
   * @param {string} _name the name of the parameter
   */
  protected parameterChanged(_name: string) {
    // hook
  }

  setInputSelection(selection: ISelection, name: string = AView.DEFAULT_SELECTION_NAME) {
    const current = this.selections.get(name);
    if (current && ViewUtils.isSameSelection(current, selection)) {
      return undefined;
    }
    this.selections.set(name, selection);
    if (name === AView.DEFAULT_SELECTION_NAME) {
      this.selection = selection;
    }
    return this.selectionChanged(name);
  }

  protected getInputSelection(name: string = AView.DEFAULT_SELECTION_NAME) {
    return this.selections.get(name);
  }

  protected getInputSelectionNames() {
    return Array.from(this.selections.keys());
  }

  /**
   * hook triggerd when the input selection has changed
   */
  protected selectionChanged(_name: string = AView.DEFAULT_SELECTION_NAME) {
    // hook
  }

  get itemIDType() {
    return this.getItemSelection()!.idtype;
  }

  /**
   * resolve the id of the current input selection
   * @returns {Promise<string[]>}
   */
  protected resolveSelection(idType = this.idType): Promise<string[]> {
    // return Promise.resolve(this.selection.ids);
    return IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, this.selection.ids, idType);
  }

  setItemSelection(selection: ISelection, name: string = AView.DEFAULT_SELECTION_NAME) {
    const current = this.itemSelections.get(name);
    if (current && ViewUtils.isSameSelection(current, selection)) {
      return;
    }
    const wasEmpty = current == null || current.idtype == null || current.ids.length === 0;
    this.itemSelections.set(name, selection);
    // propagate
    if (selection.idtype) {
      if (name === AView.DEFAULT_SELECTION_NAME) {
        if ((selection.ids?.length || 0) === 0) {
          selection.idtype.clear(SelectionUtils.defaultSelectionType);
        } else {
          selection.idtype.select(selection.ids);
        }
      } else if ((selection.ids?.length || 0) === 0) {
        selection.idtype.clear(name);
      } else {
        selection.idtype.select(name, selection.ids);
      }
    }
    const isEmpty = selection == null || selection.idtype == null || (selection.ids?.length || 0) === 0;
    if (!(wasEmpty && isEmpty)) {
      // the selection has changed when we really have some new values not just another empty one
      this.itemSelectionChanged(name);
    }

    this.fire(AView.EVENT_ITEM_SELECT, current, selection, name);
  }

  /**
   * hook when the item selection has changed
   */
  protected itemSelectionChanged(_name: string = AView.DEFAULT_SELECTION_NAME) {
    // hook
  }

  getItemSelection(name: string = AView.DEFAULT_SELECTION_NAME) {
    return this.itemSelections.get(name) || { idtype: null, ids: [] };
  }

  modeChanged(mode: EViewMode) {
    // hook
  }

  destroy() {
    this.node.remove();
  }

  isRegex(v: string) {
    // cheap test for regex
    return v.includes('*') || v.includes('.') || v.includes('|');
  }
}
