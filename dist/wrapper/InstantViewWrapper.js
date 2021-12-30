// TODO: Why?
import '../webpack/_bootstrap';
import { FindViewUtils } from '../views/FindViewUtils';
export class InstantViewWrapper {
    constructor(doc = document) {
        this.node = doc.createElement('section');
        this.node.classList.add('tdp-instant-views');
        this.node.innerHTML = `<!-- Nav tabs -->
    <ul class="nav nav-tabs" role="tablist">
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
    </div>`;
    }
    pushView(view) {
        const ul = this.node.querySelector('ul');
        const content = this.node.querySelector('.tab-content');
        content.insertAdjacentHTML('beforeend', `<div role="tabpanel" class="tab-pane tdp-busy" id="instantView_${view.id}" role="tabpanel" aria-labelledby="instantView_${view.id}"></div>`);
        const body = content.lastElementChild;
        ul.insertAdjacentHTML('beforeend', `<li class="nav-item"><a class="nav-link" href="#instantView_${view.id}" aria-controls="instantView_${view.id}" role="tab" data-bs-toggle="tab">${view.name}</a></li>`);
        ul.lastElementChild.firstElementChild.addEventListener('click', (evt) => {
            evt.preventDefault();
            // avoid Property 'tab' does not exist on type 'JQuery<EventTarget>'
            // @ts-ignore
            import('jquery').then((jquery) => $(evt.currentTarget).tab('show'));
            if (body.classList.contains('tdp-busy')) {
                // need to load
                view.load().then((r) => {
                    const instance = r.factory(this.selection, { document: this.node.ownerDocument });
                    body.appendChild(instance.node);
                    body.classList.remove('tdp-busy');
                });
            }
        });
    }
    hide() {
        this.node.toggleAttribute('hidden');
        this.clear();
    }
    clear() {
        const ul = this.node.querySelector('ul');
        const content = this.node.querySelector('.tab-content');
        ul.innerHTML = '';
        content.innerHTML = '';
    }
    setSelection(selection) {
        if (!selection) {
            this.hide();
            return;
        }
        this.node.removeAttribute('hidden');
        this.selection = selection;
        const start = this.selection.idtype;
        FindViewUtils.findInstantViews(this.selection.idtype).then((views) => {
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
            this.node.querySelector('ul a').click();
            this.node.classList.toggle('single-view', views.length === 1);
        });
    }
}
//# sourceMappingURL=InstantViewWrapper.js.map