/*********************************************************
 * Copyright (c) 2018 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 *********************************************************/

import {EventHandler} from 'phovea_core/src/event';
import {IViewProvider} from '../lineup/internal/scorecmds';
import {ISelection, IView, IViewContext, IViewPluginDesc} from '../extensions';
import ObjectNode, {cat, ref} from 'phovea_core/src/provenance/ObjectNode';
import ProvenanceGraph from 'phovea_core/src/provenance/ProvenanceGraph';
import {canAccess} from '../views/findViews';
import {notAllowedText} from '../internal/utils';
import {lazyDialogModule} from '../dialogs';
import {createContext, isSameSelection, matchLength} from '../views/interfaces';
import {AView} from '../views/AView';
import {resolveImmediately} from 'phovea_core/src';
import {none} from 'phovea_core/src/range';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {setParameter} from '../internal/cmds';


export default class ViewWrapper extends EventHandler implements IViewProvider {
  static readonly EVENT_VIEW_INITIALIZED = 'viewInitialized';
  static readonly EVENT_VIEW_CREATED = 'viewCreated';

  private instance: IView = null; //lazy
  private allowed: boolean;
  readonly node: HTMLElement;
  readonly content: HTMLElement;

  /**
   * Provenance graph reference of this object
   */
  readonly ref: ObjectNode<ViewWrapper>;

  /**
   * Provenance graph context
   */
  private context: IViewContext;

  private listenerItemSelect = (event: any, oldSelection: ISelection, newSelection: ISelection) => {
    this.fire(AView.EVENT_ITEM_SELECT, oldSelection, newSelection);
  }

  // caches before the instance exists but things are set
  private preInstanceItemSelection: ISelection = {idtype: null, range: none()};
  private preInstanceParameter = new Map<string, any>();
  private selection: ISelection;

  constructor(public readonly plugin: IViewPluginDesc, private readonly graph: ProvenanceGraph, document: Document) {
    super();
    this.node = document.createElement('article');
    this.node.classList.add('tdp-view-wrapper');
    this.allowed = canAccess(plugin);
    this.node.innerHTML = `
     <header>
        <div class="parameters form-inline"></div>
      </header>
     <main></main>
     <div class="preview-image">
        <div></div>
        <span>${!this.allowed ? notAllowedText(plugin.securityNotAllowedText) : selectionText(plugin.selection, plugin.idtype)}</span>
    </div>`;
    this.node.classList.add('view', 'disabled-view');
    this.content = <HTMLElement>this.node.querySelector('main');
    this.node.classList.toggle('not-allowed', !this.allowed);

    if (plugin.helpText) {
      this.node.insertAdjacentHTML('beforeend', `<a href="#" target="_blank" class="view-help" title="Show help of this view"><span aria-hidden="true">Show Help</span></a>`);
      this.node.lastElementChild!.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        lazyDialogModule().then((dialogs) => {
          const d = dialogs.generateDialog(plugin.name, 'Close');
          d.body.innerHTML = plugin.helpText;
          d.show();
          d.hideOnSubmit();
        });
      });
    } else if (plugin.helpUrl) {
      this.node.insertAdjacentHTML('beforeend', `<a href="${plugin.helpUrl}" target="_blank" class="view-help" title="Show help of this view"><span aria-hidden="true">Show Help</span></a>`);
    }

    if (plugin.preview) {
      plugin.preview().then((previewImage) => {
        const image = <HTMLElement>this.node.querySelector('.preview-image > div');
        image.style.backgroundImage = `url("${previewImage}")`;
      });
    }

    this.ref = graph.findOrAddObject(ref(this, plugin.name, cat.visual));
  }

  set visible(visible: boolean) {
    if (visible && this.instance == null && this.selection && this.match(this.selection)) {
      //lazy init
      this.createView(this.selection);
    }
    if (visible) {
      this.node.classList.remove('hidden');
      this.update();
    } else {
      this.node.classList.add('hidden');
    }
  }

  get visible() {
    return !this.node.classList.contains('hidden');
  }

  /**
   * as needed for the lineup contract
   * @returns {any}
   */
  getInstance() {
    if (this.instance) {
      // lineup like I hope
      return <any>this.instance;
    }
    return null;
  }

  private createView(selection: ISelection) {
    if (!this.allowed) {
      return;
    }
    return this.plugin.load().then((p) => {
      if (this.instance) {
        return; // already built race condition
      }
      // create provenance reference
      this.context = createContext(this.graph, this.plugin, this.ref);
      this.instance = p.factory(this.context, selection, this.content, {});
      this.fire(ViewWrapper.EVENT_VIEW_CREATED, this.instance);
      return resolveImmediately(this.instance.init(<HTMLElement>this.node.querySelector('header div.parameters'), this.onParameterChange.bind(this))).then(() => {
        const idType = this.instance.itemIDType;
        if (idType) {
          if (this.preInstanceItemSelection.idtype) {
            this.instance.setItemSelection(this.preInstanceItemSelection);
          } else {
            this.instance.setItemSelection({
              idtype: idType,
              range: idType.selections()
            });
          }
        }
        this.instance.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);

        this.preInstanceParameter.forEach((value, key) => {
          this.instance.setParameter(key, value);
        });
        this.preInstanceParameter.clear();

        this.fire(ViewWrapper.EVENT_VIEW_INITIALIZED, this.instance);
      });
    });
  }

  destroy() {
    if (this.instance) {
      this.destroyInstance();
    }
    this.node.remove();
  }

  matchesIDType(idType: IDType) {
    if (this.selection) {
      return this.selection.idtype === idType;
    }
    const p = this.plugin;
    return (p.idtype ? new RegExp(p.idtype) : /.*/).test(idType.id);
  }

  get idType() {
    return this.selection && this.selection.idtype ? this.selection.idtype : guessIDType(this.plugin); // TODO
  }

  private destroyInstance() {
    this.instance.destroy();
    this.content.innerHTML = '';
    (<HTMLElement>this.node.querySelector('header div.parameters')).innerHTML = '';
    this.instance.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
    this.instance = null;
  }

  private onParameterChange(name: string, value: any, previousValue: any) {
    return this.context.graph.push(setParameter(this.ref, name, value, previousValue));
  }

  getParameter(name: string) {
    if (this.instance) {
      return this.instance.getParameter(name);
    }
    return this.preInstanceParameter.get(name);
  }

  setParameterImpl(name: string, value: any) {
    if (this.instance) {
      return this.instance.setParameter(name, value);
    }
    this.preInstanceParameter.set(name, value);
    return null;
  }

  setParameterSelection(selection?: ISelection) {
    if (isSameSelection(this.selection, selection)) {
      return;
    }
    this.selection = selection;
    if (selection) {
      this.node.dataset.idtype = selection.idtype.id;
    }
    const matches = selection && this.match(selection);
    this.node.classList.toggle('disabled-view', !this.allowed || !matches);

    if (this.instance) {
      if (matches) {
        return this.instance.setInputSelection(selection);
      } else {
        this.destroyInstance();
      }
    } else if (matches && this.visible) {
      return this.createView(selection);
    }
  }

  private match(selection: ISelection) {
    return matchLength(this.plugin.selection, selection.range.dim(0).length);
  }

  getParameterSelection() {
    return this.selection;
  }

  get itemIDType(): IDType | null {
    return this.instance ? this.instance.itemIDType : null;
  }

  getItemSelection(): ISelection {
    if (this.instance) {
      return this.instance.getItemSelection();
    }
    return this.preInstanceItemSelection;
  }

  setItemSelection(sel: ISelection) {
    if (this.instance) {
      this.instance.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
      this.instance.setItemSelection(sel);
      this.instance.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
      return;
    }
    this.preInstanceItemSelection = sel;
  }

  update() {
    if (this.visible && this.instance && typeof (<any>this.instance).update === 'function' && this.node.getBoundingClientRect().width > 0) {
      (<any>this.instance!).update();
    }
  }

  dumpReference() {
    return this.ref.id;
  }
}


function selectionText(selection: any, idType: string) {
  const label = idType.includes('*') || idType.includes('(') ? 'item' : resolve(idType).name;
  switch (String(selection)) {
    case '':
    case 'none':
    case '0':
      return `No ${label} is required`;
    case 'any':
      return `Any number of ${label}s is valid`;
    case 'single':
    case '1':
      return `Exactly one ${label} is required`;
    case 'small_multiple':
    case 'multiple':
    case 'some':
    case 'chooser':
      return `One or more ${label}s are required`;
    case '2':
      return `Exactly two ${label}s are required`;
    default:
      console.error('unknown selector: ', selection, idType);
      return `Unknown selector: ${selection}`;
  }
}

export function guessIDType(v: IViewPluginDesc): IDType | null {
  return v.idtype.includes('*') ? null : resolve(v.idtype);
}
