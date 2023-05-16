import { PluginRegistry } from 'visyn_core/plugin';
export class VisUtils {
    static extrapolateFilter(r) {
        const v = r.filter;
        if (typeof v === 'undefined') {
            r.filter = () => true;
        }
        else if (typeof v === 'string') {
            r.filter = (data) => data && data.desc.type && data.desc.type.match(v) != null;
        }
        else if (Array.isArray(v)) {
            r.filter = (data) => data && data && data.desc.type && data.desc.type.match(v[0]) && (data.desc.value === undefined || data.desc.value.type.match(v[1]));
        }
    }
    static extrapolateIconify(r) {
        if (typeof r.iconify === 'function') {
            return;
        }
        r.iconify = function iconfiy(node) {
            node.title = this.name;
            const anyThis = this;
            if (anyThis.iconcss) {
                node.classList.add('phovea-vis-icon');
                node.classList.add(anyThis.iconcss);
            }
            else if (anyThis.icon) {
                node.classList.add('phovea-vis-icon');
                node.style.width = '1em';
                node.style.display = 'inline-block';
                node.style.textAlign = 'center';
                node.style.backgroundSize = '100%';
                node.style.backgroundRepeat = 'no-repeat';
                // lazy load icon
                anyThis.icon().then((iconData) => {
                    node.style.backgroundImage = `url(${iconData})`;
                });
                node.innerHTML = '&nbsp';
            }
            else {
                node.innerText = this.name.substr(0, 1).toUpperCase();
            }
            return node;
        };
    }
    static extrapolateSize(r) {
        r.scaling = r.scaling || 'free';
        if (Array.isArray(r.sizeDependsOnDataDimension) && typeof r.sizeDependsOnDataDimension[0] === 'boolean') {
            // ok
        }
        else if (typeof r.sizeDependsOnDataDimension === 'boolean') {
            r.sizeDependsOnDataDimension = [r.sizeDependsOnDataDimension, r.sizeDependsOnDataDimension];
        }
        else {
            r.sizeDependsOnDataDimension = [false, false];
        }
    }
    static extrapolateRotation(r) {
        const m = {
            // string to text mappings
            free: NaN,
            no: 0,
            transpose: 90,
            swap: 180,
        };
        if (typeof r.rotation === 'string' && r.rotation in m) {
            r.rotation = m[r.rotation];
        }
        else if (typeof r.rotation === 'number') {
            r.rotation = +r.rotation;
        }
        else if (r.rotation === null) {
            r.rotation = NaN;
        }
        else {
            r.rotation = 0;
        }
    }
    static toVisPlugin(plugin) {
        const r = plugin;
        VisUtils.extrapolateFilter(r);
        VisUtils.extrapolateIconify(r);
        VisUtils.extrapolateSize(r);
        VisUtils.extrapolateRotation(r);
        return r;
    }
    /**
     * list a vis plugins and check in addition whether the match the given data type
     * @param data the data type to visualize
     * @returns {IPluginDesc[]}
     */
    static listVisPlugins(data) {
        // filter additionally with the filter attribute, which can be a function or the expected data type
        return PluginRegistry.getInstance()
            .listPlugins('vis')
            .map(VisUtils.toVisPlugin)
            .filter((desc) => desc.filter(data));
    }
    static assignVis(node, vis) {
        node.__vis__ = vis;
    }
}
//# sourceMappingURL=VisUtils.js.map