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


import {loadBootstrap} from 'phovea_ui/dist/_lazyBootstrap';
import {IInstanceViewExtensionDesc, IItemSelection} from '../extensions';
import {findInstantViews} from '../views/findViews';

export class InstantViewWrapper {
  readonly node: HTMLElement;

  private selection: IItemSelection;

  constructor(doc: Document = document) {
    this.node = doc.createElement('section');
    this.node.classList.add('tdp-instant-views');

    this.node.innerHTML = `<!-- Nav tabs -->
    <ul class="nav nav-tabs" role="tablist">
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
    </div>`;
  }

  pushView(view: IInstanceViewExtensionDesc) {
    const ul = this.node.querySelector('ul');
    const content = <HTMLElement>this.node.querySelector('.tab-content');

    content.insertAdjacentHTML('beforeend', `<div role="tabpanel" class="tab-pane tdp-busy" id="instantView_${view.id}"></div>`);
    const body = <HTMLElement>content.lastElementChild!;

    ul.insertAdjacentHTML('beforeend', `<li role="presentation"><a href="#instantView_${view.id}" aria-controls="instantView_${view.id}" role="tab" data-toggle="tab">${view.name}</a></li>`);
    ul.lastElementChild.firstElementChild!.addEventListener('click', (evt) => {
      evt.preventDefault();
      loadBootstrap().then(($) => $(evt.currentTarget).tab('show'));
      if (body.classList.contains('tdp-busy')) {
        // need to load
        view.load().then((r) => {
          const instance = r.factory(this.selection, {document: this.node.ownerDocument});
          body.appendChild(instance.node);
          body.classList.remove('tdp-busy');
        });
      }
    });
  }

  hide() {
    this.node.classList.add('hidden');
    this.clear();
  }

  private clear() {
    const ul = this.node.querySelector('ul');
    const content = <HTMLElement>this.node.querySelector('.tab-content');
    ul.innerHTML = '';
    content.innerHTML = '';
  }

  setSelection(selection?: IItemSelection) {
    if (!selection) {
      this.hide();
      return;
    }

    this.node.classList.remove('hidden');

    this.selection = selection;

    const start = this.selection.idtype;
    findInstantViews(this.selection.idtype).then((views) => {
      if (start !== this.selection.idtype) {
        // changed in the meanwhile
        return;
      }
      if (views.length === 0) {
        this.hide();
        return;
      }
      this.clear();
      views.forEach((v) => this.pushView(v));
      (<HTMLElement>this.node.querySelector('ul a')).click();
      this.node.classList.toggle('single-view', views.length === 1);
    });
  }
}
