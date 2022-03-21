/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import * as React from 'react';
import { EXTENSION_POINT_TDP_VIEW } from '../base';
import { AView } from './AView';
import { ViewUtils } from './ViewUtils';
import { PluginRegistry } from '../app';
import { IDTypeManager } from '../idtype';
import { LocalStorageProvenanceGraphManager, ObjectRefUtils } from '../clue/provenance';
import { AReactView } from './AReactView';
export class TDPView extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.viewPromise = null;
        this.view = null;
        this.viewId = null;
        this.listener = (_, _oldSelection, newSelection) => {
            this.triggerSelection(newSelection);
        };
        this.state = {
            viewPlugin: ViewUtils.toViewPluginDesc(PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_VIEW, props.viewId)),
        };
    }
    componentDidMount() {
        this.componentDidUpdate();
    }
    componentDidUpdate() {
        const { viewId } = this.props;
        if (this.viewId !== viewId) {
            if (this.view) {
                this.view.destroy();
                this.view = null;
            }
            else if (this.viewPromise) {
                this.viewPromise.then((v) => v.destroy());
            }
            this.view = null;
            this.viewPromise = null;
            this.viewId = viewId;
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                viewPlugin: ViewUtils.toViewPluginDesc(PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_VIEW, viewId)),
            });
        }
        if (!this.state.viewPlugin) {
            return;
        }
        const idType = IDTypeManager.getInstance().resolveIdType(this.state.viewPlugin.idtype);
        if (!this.viewPromise) {
            const options = {
                reactHandler: this,
            };
            const selection = this.buildSelection(idType, this.props.inputSelection);
            const context = this.createContext();
            this.viewPromise = Promise.all([this.state.viewPlugin.load(), selection]).then((args) => {
                const p = args[0];
                const s = args[1];
                this.view = p.factory(context, s, this.node.lastElementChild, options);
                this.view.init(this.node.firstElementChild, (name, value) => Promise.resolve(this.view.setParameter(name, value)));
                this.node.classList.add('tdp-view-wrapper');
                if (this.view instanceof AReactView) {
                    // native rendering
                    return undefined;
                }
                this.view.on(AView.EVENT_ITEM_SELECT, this.listener);
                if (this.view.itemIDType) {
                    return this.buildSelection(this.view.itemIDType, this.props.itemSelection).then((itemSelection) => {
                        this.view.off(AView.EVENT_ITEM_SELECT, this.listener);
                        this.view.setItemSelection(itemSelection);
                        this.view.on(AView.EVENT_ITEM_SELECT, this.listener);
                        return this.view;
                    });
                }
                return this.view;
            });
        }
        this.viewPromise.then((view) => {
            if (this.view instanceof AReactView) {
                // native rendering
                return;
            }
            this.buildSelection(idType, this.props.inputSelection).then((s) => view.setInputSelection(s));
            if (view.itemIDType) {
                this.buildSelection(this.view.itemIDType, this.props.itemSelection).then((s) => {
                    this.view.off(AView.EVENT_ITEM_SELECT, this.listener);
                    this.view.setItemSelection(s);
                    this.view.on(AView.EVENT_ITEM_SELECT, this.listener);
                });
            }
        });
    }
    componentWillUnmount() {
        if (this.view) {
            this.view.destroy();
            this.view = null;
            this.viewPromise = null;
        }
        if (this.viewPromise) {
            this.viewPromise.then((r) => r.destroy());
            this.viewPromise = null;
        }
    }
    createContext() {
        const manager = new LocalStorageProvenanceGraphManager();
        const graph = manager.createInMemory();
        const ref = graph.findOrAddJustObject(this, `React@${this.props.viewId}`, ObjectRefUtils.category.visual);
        return {
            graph,
            desc: this.state.viewPlugin,
            ref,
        };
    }
    buildSelection(idtype, selection) {
        if (!selection) {
            return Promise.resolve({ idtype, ids: [] });
        }
        return Promise.resolve({ idtype, ids: selection });
    }
    triggerSelection(selection) {
        if (!this.props.onItemSelectionChanged) {
            return;
        }
        this.props.onItemSelectionChanged(Array.from(selection.ids), selection.idtype.id);
    }
    selectNative(item, op = 'set') {
        const items = Array.isArray(item) ? item : [item];
        if (!this.props.onItemSelectionChanged) {
            return; // nobody cares
        }
        const s = new Set(this.props.itemSelection || []);
        switch (op) {
            case 'set':
                s.clear();
                items.forEach((i) => s.add(i));
                break;
            case 'add':
                items.forEach((i) => s.add(i));
                break;
            case 'remove':
                items.forEach((i) => s.delete(i));
                break;
            case 'toggle':
                items.forEach((i) => (s.has(i) ? s.delete(i) : s.add(i)));
                break;
            default:
                break;
        }
        this.props.onItemSelectionChanged(Array.from(s), this.view.itemIDType ? this.view.itemIDType.id : null);
    }
    render() {
        const buildItem = () => {
            if (!this.state.viewPlugin) {
                return `Invalid View Id: ${this.props.viewId}`;
            }
            if (this.view && this.view instanceof AReactView) {
                return this.view.render(this.props.inputSelection || [], this.props.itemSelection || [], (item, op) => this.selectNative(item, op));
            }
            return '';
        };
        return (React.createElement("div", { ref: (ref) => (this.node = ref), className: "tdp-view" },
            React.createElement("header", null),
            React.createElement("main", null, buildItem())));
    }
}
//# sourceMappingURL=TDPView.js.map