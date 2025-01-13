import { EventHandler, WebpackEnv } from 'visyn_core/base';
import { I18nextManager } from 'visyn_core/i18n';
import { IDTypeManager } from 'visyn_core/idtype';
import { PluginRegistry } from 'visyn_core/plugin';
import { BaseUtils } from '../base';
import { AView } from './AView';
import { ViewUtils } from './ViewUtils';
import { EViewMode } from '../base/interfaces';
import { BuilderUtils, LAYOUT_CONTAINER_WRAPPER, LayoutContainerEvents, } from '../layout';
export function isCompositeViewPluginDesc(desc) {
    return Array.isArray(desc.elements);
}
function prefix(key, rest) {
    return `${key}.${rest}`;
}
function unprefix(name) {
    const index = name.indexOf('.');
    if (index < 0) {
        return { key: '', rest: name };
    }
    return {
        key: name.slice(0, index),
        rest: name.slice(index + 1),
    };
}
class WrapperView {
    constructor(instance, key) {
        this.instance = instance;
        this.key = key;
        this._visible = true;
    }
    get minSize() {
        const given = this.instance.naturalSize;
        if (Array.isArray(given)) {
            return given;
        }
        return [0, 0];
    }
    createParams(hideHeader) {
        const parent = this.node.closest(`.${LAYOUT_CONTAINER_WRAPPER}`);
        const header = parent.querySelector('header');
        if (hideHeader) {
            header.innerHTML = '';
        }
        header.insertAdjacentHTML('beforeend', `<div class="parameters container-fluid ps-0 pe-0"></div>`);
        return header.lastElementChild;
    }
    get node() {
        return this.instance.node;
    }
    destroy() {
        this.instance.destroy();
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        this._visible = value;
        this.instance.modeChanged(value ? EViewMode.FOCUS : EViewMode.HIDDEN);
    }
    resized() {
        if (this.visible && this.instance && typeof this.instance.update === 'function' && this.node.getBoundingClientRect().width > 0) {
            this.instance.update();
        }
    }
    dumpReference() {
        return -1;
    }
}
export class CompositeView extends EventHandler {
    constructor(context, selection, parent, options = {}) {
        super();
        this.context = context;
        this.selection = selection;
        this.options = {
            showHeaders: false,
        };
        this.children = [];
        this.childrenLookup = new Map();
        this.debounceUpdateEntryPoint = BaseUtils.debounce(() => this.fire(AView.EVENT_UPDATE_ENTRY_POINT));
        Object.assign(this.options, options);
        if (this.isRegex(context.desc.idtype)) {
            this.idType = selection.idtype;
        }
        else {
            this.idType = IDTypeManager.getInstance().resolveIdType(context.desc.idtype);
        }
        this.root = BuilderUtils.root(BuilderUtils.view(I18nextManager.getInstance().i18n.t('tdp:core.views.noViews')));
        this.root.node.classList.add('tdp-view', 'composite-view');
        parent.appendChild(this.root.node);
    }
    init(params, onParameterChange) {
        return this.build().then(() => Promise.all(this.initChildren(onParameterChange)));
    }
    get node() {
        return this.root.node;
    }
    setBusy(busy) {
        this.node.classList.toggle('busy', busy);
    }
    build() {
        this.setBusy(true);
        const updateShared = (evt, name, oldValue, newValue) => {
            // If a child updates any shared parameters, notify each child except the trigger.
            this.children.forEach(({ instance }) => {
                if (evt.currentTarget !== instance) {
                    instance.off(AView.EVENT_UPDATE_SHARED, updateShared);
                    instance.updateShared(name, newValue);
                    instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
                }
            });
            // Propagate the event upwards.
            // This is required if a CompositeView is nested in a CompositeView, because otherwise
            // the CompositeView child would "swallow" the event here. But we want to pass it "up" the chain,
            // such that we have to fire it again.
            this.fire(AView.EVENT_UPDATE_SHARED, name, oldValue, newValue);
        };
        const toParentElement = (evt) => {
            const source = evt.currentTarget;
            const view = this.children.find(({ instance }) => instance === source);
            const layout = this.root.find((d) => d.type === 'view' && d.view === view);
            return layout.parent;
        };
        const updateRatios = (evt, ...ratios) => {
            const parent = toParentElement(evt);
            if (parent && parent.type === 'split') {
                parent.ratios = ratios;
            }
        };
        const setActiveTab = (evt, tabKey) => {
            const parent = toParentElement(evt);
            const view = this.children.find(({ key }) => key === tabKey);
            const layout = this.root.find((d) => d.type === 'view' && d.view === view);
            if (parent && parent.type === 'tabbing' && layout) {
                parent.active = layout;
            }
        };
        return Promise.resolve(this.createSetup()).then((setup) => {
            this.setup = setup;
            const helper = this.node.ownerDocument.createElement('div');
            const links = setup.linkedSelections;
            let debounceItemSelection;
            {
                let selection;
                let old;
                const debounced = BaseUtils.debounce(() => {
                    this.itemSelection = selection;
                    const oo = old;
                    old = null;
                    this.fire(AView.EVENT_ITEM_SELECT, oo, selection);
                });
                debounceItemSelection = (_evt, previous, act) => {
                    selection = act;
                    if (!old) {
                        old = previous;
                    }
                    debounced();
                };
            }
            this.setup.elements.forEach((d) => {
                let s = this.selection;
                if (links.length > 0 && !links.some((l) => l.fromKey === '_input' && l.toKey === d.key)) {
                    s = { idtype: this.selection.idtype, ids: [] };
                }
                // Fix for nested CompositeViews:
                // Previously, nested CompositeViews were not possible, i.e. when using a CompositeView as element of a CompositeView.
                // This is due to the fact that the context given to the children of a CompositeView is the context of the CompositeView.
                // This of course breaks when a child is a CompositeView, as it expects its "own" desc. When you give it the parent desc, it extracts
                // the children from the parent causing an infinite loop as it receives itself as child.
                // I have to admit that I do not know why we give it the desc of the CompositeView parent, and not its own.
                // The fix is to override the desc with the child desc if it is a CompositeViewDesc, such that it receives the "correct" children.
                const patchedContext = isCompositeViewPluginDesc(d.desc) ? { ...this.context, desc: d.desc } : this.context;
                const instance = d.create(patchedContext, s, helper, d.options);
                if (links.length === 0 || links.some((l) => l.fromKey === d.key && l.toKey === '_item')) {
                    instance.on(AView.EVENT_ITEM_SELECT, debounceItemSelection);
                }
                instance.on(AView.EVENT_UPDATE_ENTRY_POINT, this.debounceUpdateEntryPoint);
                instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
                instance.on(CompositeView.VIEW_COMPOSITE_EVENT_CHANGE_RATIOS, updateRatios);
                instance.on(CompositeView.VIEW_COMPOSITE_EVENT_SET_ACTIVE_TAB, setActiveTab);
                this.childrenLookup.set(d.key, instance);
                this.children.push(new WrapperView(instance, d.key));
            });
            links.forEach((l) => {
                if (l.fromKey.startsWith('_') || l.toKey.startsWith('_')) {
                    // handled separately
                    return;
                }
                const from = this.childrenLookup.get(l.fromKey);
                const to = this.childrenLookup.get(l.toKey);
                if (!from || !to) {
                    console.warn('invalid configuration, cannot find: ', from, 'or', to, 'in this setup');
                    return;
                }
                from.on(AView.EVENT_ITEM_SELECT, (_, _old, selection) => {
                    if (l.mode === 'item') {
                        to.setItemSelection(selection);
                    }
                    else {
                        to.setInputSelection(selection);
                    }
                });
            });
            const resizedAfterUpdate = BaseUtils.debounce(() => this.children.forEach((c) => c.resized()));
            if (this.children.length === 1) {
                const first = this.children[0];
                this.root.root = this.root.build(BuilderUtils.view(first).name(first.key).fixed());
                this.root.on(LayoutContainerEvents.EVENT_LAYOUT_CHANGED, resizedAfterUpdate);
                this.setBusy(false);
                return;
            }
            const views = new Map(this.children.map((d) => [d.key, BuilderUtils.view(d).name(d.key).fixed()]));
            this.buildLayout(views, this.children.map((d) => d.key));
            this.root.on(LayoutContainerEvents.EVENT_LAYOUT_CHANGED, resizedAfterUpdate);
        });
    }
    buildLayout(views, keys) {
        const buildImpl = (layout) => {
            const l = typeof layout === 'string'
                ? layout
                : {
                    type: 'vsplit',
                    ratios: keys.map(() => 1 / keys.length),
                    keys,
                    ...(layout || {}),
                };
            if (typeof l === 'string') {
                return views.get(l);
            }
            if (l.keys.length === 1) {
                return buildImpl(l.keys[0]);
            }
            const ratio = l.ratios;
            switch (l.type) {
                case 'hsplit':
                    // eslint-disable-next-line no-case-declarations
                    const firstH = buildImpl(l.keys[0]);
                    // eslint-disable-next-line no-case-declarations
                    const secondH = buildImpl(l.keys[1]);
                    return BuilderUtils.horizontalSplit(ratio[0], firstH, secondH).fixedLayout();
                case 'hstack':
                    return BuilderUtils.horizontalStackedLineUp(...l.keys.map(buildImpl)).fixedLayout();
                case 'vstack':
                    return BuilderUtils.verticalStackedLineUp(...l.keys.map(buildImpl)).fixedLayout();
                case 'tabbing':
                    return BuilderUtils.tabbing(...l.keys.map(buildImpl)).fixedLayout();
                // case 'vsplit':
                default: {
                    const firstV = buildImpl(l.keys[0]);
                    const secondV = buildImpl(l.keys[1]);
                    return BuilderUtils.verticalSplit(ratio[0], firstV, secondV).fixedLayout();
                }
            }
        };
        this.root.root = this.root.build(buildImpl(this.setup.layout));
    }
    initChildren(onParameterChange) {
        return this.children.map((wrapper) => {
            // forward prefixed
            const onChildChanged = (name, value, previousValue) => {
                return onParameterChange(prefix(wrapper.key, name), value, previousValue);
            };
            return wrapper.instance.init(wrapper.createParams(!this.options.showHeaders), onChildChanged);
        });
    }
    update() {
        if (this.root) {
            this.root.resized();
        }
    }
    get itemIDType() {
        if (this.children.length === 0 || !this.setup) {
            return null;
        }
        const link = this.setup.linkedSelections.find((d) => d.toKey === '_item');
        if (link) {
            return this.childrenLookup.get(link.fromKey).itemIDType;
        }
        // last view by default
        return this.children[this.children.length - 1].instance.itemIDType;
    }
    updateShared(name, value) {
        this.children.forEach(({ instance }) => instance.updateShared(name, value));
    }
    getParameter(name) {
        // check prefixed
        const { key, rest } = unprefix(name);
        const child = this.childrenLookup.get(key);
        if (child) {
            return child.getParameter(rest);
        }
        if (WebpackEnv.__DEBUG__) {
            console.warn('invalid parameter detected', name, this.context.desc);
        }
        return null;
    }
    setParameter(name, value) {
        const { key, rest } = unprefix(name);
        const child = this.childrenLookup.get(key);
        if (child) {
            return child.setParameter(rest, value);
        }
        if (WebpackEnv.__DEBUG__) {
            console.warn('invalid parameter detected', name, this.context.desc);
        }
        return undefined;
    }
    setInputSelection(selection) {
        if (ViewUtils.isSameSelection(this.selection, selection)) {
            return;
        }
        this.selection = selection;
        if (!this.setup) {
            return;
        }
        if (this.setup.linkedSelections.length === 0) {
            this.children.forEach(({ instance }) => instance.setInputSelection(selection));
            return;
        }
        this.setup.linkedSelections
            .filter((d) => d.fromKey === '_input')
            .forEach((d) => {
            const instance = this.childrenLookup.get(d.toKey);
            if (!instance) {
                return;
            }
            if (d.mode === 'item') {
                instance.setItemSelection(selection);
            }
            else {
                instance.setInputSelection(selection);
            }
        });
    }
    setItemSelection(selection) {
        this.itemSelection = selection;
        const { itemIDType } = this;
        if (this.setup.linkedSelections.length === 0) {
            this.children.forEach(({ instance }) => {
                if (instance.itemIDType === itemIDType) {
                    instance.setItemSelection(selection);
                }
            });
            return;
        }
        this.setup.linkedSelections
            .filter((d) => d.fromKey === '_item')
            .forEach((d) => {
            const instance = this.childrenLookup.get(d.toKey);
            if (!instance) {
                return;
            }
            if (d.mode === 'input') {
                instance.setInputSelection(selection);
            }
            else {
                instance.setItemSelection(selection);
            }
        });
    }
    getItemSelection() {
        return this.itemSelection;
    }
    modeChanged(mode) {
        this.children.forEach(({ instance }) => instance.modeChanged(mode));
    }
    destroy() {
        this.children.forEach(({ instance }) => instance.destroy());
        this.node.remove();
    }
    createSetup() {
        const desc = this.context.desc;
        const toEntry = (d) => {
            const descOptions = d.options || {};
            return Promise.resolve(d.loader()).then((instance) => ({
                key: d.key,
                desc: d,
                options: { ...descOptions, ...this.options }, // also pass the view options from the ViewWrapper to all views
                create: PluginRegistry.getInstance().getFactoryMethod(instance, d.factory || 'create'),
            }));
        };
        return Promise.all((desc.elements || []).map(toEntry)).then((elements) => ({
            elements,
            layout: desc.layout,
            linkedSelections: desc.linkedSelections || [],
        }));
    }
    updateLineUpStats() {
        // propagate to all view instances, i.e lineups
        this.children.forEach((d) => {
            const i = d.instance;
            // semi hack for provenance graph
            if (typeof i.updateLineUpStats === 'function') {
                i.updateLineUpStats();
            }
        });
    }
    isRegex(v) {
        // cheap test for regex
        return v.includes('*') || v.includes('.') || v.includes('|');
    }
}
CompositeView.VIEW_COMPOSITE_EVENT_CHANGE_RATIOS = 'changeRatios';
CompositeView.VIEW_COMPOSITE_EVENT_SET_ACTIVE_TAB = 'setActiveTab';
//# sourceMappingURL=CompositeView.js.map