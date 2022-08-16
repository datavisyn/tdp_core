import { isEqual } from 'lodash';
import { EXTENSION_POINT_TDP_VIEW, EXTENSION_POINT_VISYN_VIEW, EXTENSION_POINT_TDP_LIST_FILTERS, EXTENSION_POINT_TDP_INSTANT_VIEW, EXTENSION_POINT_TDP_VIEW_GROUPS, } from '../base/extensions';
import { IDTypeManager } from '../idtype';
import { PluginRegistry } from '../app/PluginRegistry';
import { UserSession } from '../app/UserSession';
export class ViewUtils {
    static toViewPluginDesc(p) {
        const r = p;
        r.selection = r.selection || 'none';
        r.group = { name: 'Other', order: 99, ...r.group };
        r.securityNotAllowedText = r.securityNotAllowedText != null ? r.securityNotAllowedText : false;
        // common typo
        if (r.idType !== undefined) {
            r.idtype = r.idType;
        }
        return r;
    }
    static matchLength(s, length) {
        switch (String(s)) {
            case '':
            case 'none':
            case '0':
                return length === 0;
            case 'any':
                return true;
            case 'single':
            case '1':
            case 'small_multiple':
                return length === 1;
            case 'multiple':
            case 'chooser':
            case 'some':
                return length >= 1;
            case '2':
                return length === 2;
            default:
                return false;
        }
    }
    /**
     * whether the view should be used as small multiple in case of multiple selections
     * @param desc
     * @returns {boolean}
     */
    static showAsSmallMultiple(desc) {
        return desc.selection === 'small_multiple';
    }
    /**
     * whether the view is going to use a chooser for multiple selections
     * @param desc
     * @returns {boolean}
     */
    static willShowChooser(desc) {
        return desc.selection === 'chooser';
    }
    /**
     * compares two selections and return true if they are the same
     * @param {ISelection} a
     * @param {ISelection} b
     * @returns {boolean}
     */
    static isSameSelection(a, b) {
        var _a, _b, _c, _d;
        const aNull = a == null || a.idtype == null;
        const bNull = b == null || b.idtype == null;
        if (aNull || bNull) {
            return aNull === bNull;
        }
        const base = a.idtype.id === b.idtype.id && isEqual((_b = (_a = a.ids) === null || _a === void 0 ? void 0 : _a.slice()) === null || _b === void 0 ? void 0 : _b.sort(), (_d = (_c = b.ids) === null || _c === void 0 ? void 0 : _c.slice()) === null || _d === void 0 ? void 0 : _d.sort());
        if (!base) {
            return false;
        }
        const aAllSize = a.all ? a.all.size : 0;
        const bAllSize = b.all ? b.all.size : 0;
        if (aAllSize !== bAllSize) {
            return undefined;
        }
        if (aAllSize === 0) {
            return true;
        }
        // same size but not empty check entries
        return Array.from(a.all.entries()).every(([key, value]) => {
            var _a, _b;
            const other = b.all.get(key);
            if (!other) {
                return false;
            }
            return isEqual((_a = value === null || value === void 0 ? void 0 : value.slice()) === null || _a === void 0 ? void 0 : _a.sort(), (_b = other === null || other === void 0 ? void 0 : other.slice()) === null || _b === void 0 ? void 0 : _b.sort());
        });
    }
    static createContext(graph, desc, ref) {
        return {
            graph,
            desc: ViewUtils.toViewPluginDesc(desc),
            ref,
        };
    }
    /**
     * finds for the given IDType and selection matching views
     * @param {IDType} idType the idtype to lookfor
     * @param {string[]} selection the current input selection
     * @returns {Promise<IViewPluginDesc[]>} list of views and whether the current selection count matches their requirements
     */
    static findViews(idType, selection) {
        const selectionLength = selection.length;
        function bySelection(p) {
            return ViewUtils.matchLength(p.selection, selectionLength) || (ViewUtils.showAsSmallMultiple(p) && selectionLength > 1);
        }
        return ViewUtils.findViewBase(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW), true).then((r) => {
            return r
                .map(ViewUtils.toViewPluginDesc)
                .map((v) => {
                const access = ViewUtils.canAccess(v);
                const sel = bySelection(v);
                const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
                return {
                    ...v,
                    enabled: access && sel,
                    disabledReason: !access ? (hasAccessHint ? 'security' : 'invalid') : !sel ? 'selection' : undefined,
                };
            })
                .filter((v) => v.disabledReason !== 'invalid');
        });
    }
    static findAllViews(idType) {
        return ViewUtils.findViewBase(idType || null, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW), true).then((r) => {
            return r
                .map(ViewUtils.toViewPluginDesc)
                .map((v) => {
                const access = ViewUtils.canAccess(v);
                const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
                return {
                    ...v,
                    enabled: access,
                    disabledReason: !access ? (hasAccessHint ? 'security' : 'invalid') : undefined,
                };
            })
                .filter((v) => v.disabledReason !== 'invalid');
        });
    }
    static findVisynViews(idType) {
        return ViewUtils.findViewBase(idType || null, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_VISYN_VIEW), true).then((r) => {
            return r
                .map((v) => ViewUtils.toViewPluginDesc(v))
                .map((v) => {
                const access = ViewUtils.canAccess(v);
                const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
                return {
                    ...v,
                    enabled: access,
                    disabledReason: !access ? (hasAccessHint ? 'security' : 'invalid') : undefined,
                };
            })
                .filter((v) => v.disabledReason !== 'invalid');
        });
    }
    static async findViewBase(idType, views, hasSelection) {
        const byTypeChecker = async () => {
            const mappedTypes = await IDTypeManager.getInstance().getCanBeMappedTo(idType);
            const all = [idType].concat(mappedTypes);
            return (p) => {
                const idT = p.idType !== undefined ? p.idType : p.idtype;
                const pattern = idT ? new RegExp(idT) : /.*/;
                return all.some((i) => pattern.test(i.id)) && (!hasSelection || p.selection === 'any' || !ViewUtils.matchLength(p.selection, 0));
            };
        };
        const byType = idType ? await byTypeChecker() : () => true;
        // execute extension filters
        const filters = await Promise.all(PluginRegistry.getInstance()
            .listPlugins(EXTENSION_POINT_TDP_LIST_FILTERS)
            .map((plugin) => plugin.load()));
        function extensionFilters(p) {
            const f = p.filter || {};
            return filters.every((filter) => filter.factory(f));
        }
        return views.filter((p) => byType(p) && extensionFilters(p)).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    static canAccess(p) {
        let { security } = p;
        if (security === undefined) {
            return true;
        }
        if (typeof security === 'string') {
            const role = security;
            security = (user) => user.roles.indexOf(role) >= 0;
        }
        if (typeof security === 'function') {
            const user = UserSession.getInstance().currentUser();
            if (!user) {
                return false;
            }
            return security(user);
        }
        if (typeof security === 'boolean') {
            if (security === true) {
                // if security is set on a view with a boolean flag check if the user is at least logged in
                return UserSession.getInstance().isLoggedIn();
            }
            return true; // security is disabled - the resource is publicly available, the user can access it
        }
        return true;
    }
    static findInstantViews(idType) {
        return ViewUtils.findViewBase(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_INSTANT_VIEW), false).then((r) => r.filter(ViewUtils.canAccess));
    }
    static caseInsensitiveCompare(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }
    static resolveGroupData() {
        const plugins = PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW_GROUPS);
        const r = new Map();
        plugins.forEach((plugin) => {
            (plugin.groups || []).forEach((g) => {
                g.label = g.label || g.name;
                g.description = g.description || '';
                r.set(g.name, g);
            });
        });
        return r;
    }
    static groupByCategory(views) {
        const grouped = new Map();
        views.forEach((elem) => {
            if (!grouped.has(elem.group.name)) {
                grouped.set(elem.group.name, [elem]);
            }
            else {
                grouped.get(elem.group.name).push(elem);
            }
        });
        const sortView = (a, b, members) => {
            // members attribute has priority
            if (members) {
                const indexA = members.indexOf(a.name);
                const indexB = members.indexOf(b.name);
                if (indexA >= 0 && indexB >= 0) {
                    return indexA - indexB;
                }
                if (indexA >= 0) {
                    return -1;
                }
                if (indexB >= 0) {
                    return 1;
                }
            }
            const orderA = a.group.order;
            const orderB = b.group.order;
            if (orderA === orderB) {
                return ViewUtils.caseInsensitiveCompare(a.name, b.name);
            }
            return orderA - orderB;
        };
        const sortGroup = (a, b) => {
            const orderA = a.order;
            const orderB = b.order;
            if (orderA === orderB) {
                return ViewUtils.caseInsensitiveCompare(a.name, b.name);
            }
            return orderA - orderB;
        };
        const groupData = ViewUtils.resolveGroupData();
        const groups = Array.from(grouped).map(([name, v]) => {
            let base = groupData.get(name);
            if (!base) {
                base = { name, label: name, description: '', order: 900 };
            }
            const sortedViews = v.sort((a, b) => sortView(a, b, base.members));
            return Object.assign(base, { views: sortedViews });
        });
        return groups.sort(sortGroup);
    }
}
/**
 * event when one or more elements are selected for the next level
 * @type {string}
 * @argument selection {ISelection}
 */
ViewUtils.VIEW_EVENT_ITEM_SELECT = 'select';
ViewUtils.VIEW_EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';
ViewUtils.VIEW_EVENT_LOADING_FINISHED = 'loadingFinished';
ViewUtils.VIEW_EVENT_UPDATE_SHARED = 'updateShared';
//# sourceMappingURL=ViewUtils.js.map