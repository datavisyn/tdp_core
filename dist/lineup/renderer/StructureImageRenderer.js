import { ERenderMode, renderMissingDOM } from 'lineupjs';
import { abortAble } from 'lineupengine';
import { StructureImageColumn } from './StructureImageColumn';
import { AppContext } from '../../app';
const template = '<a target="_blank" rel="noopener" style="background-size: contain; background-position: center; background-repeat: no-repeat;"></a>';
export function getImageURL(structure, substructure = null, align = null) {
    return `/api/image/?structure=${encodeURIComponent(structure)}${substructure ? `&substructure=${encodeURIComponent(substructure)}` : ''}${align ? `&align=${encodeURIComponent(align)}` : ''}`;
}
export function getReducedImages(structures, method = 'auto') {
    //   return fetchText('/api/image/', {
    //     structures,
    //     method,
    //   }).catch(() => null);
    return AppContext.getInstance()
        .getAPIData('/image', { structures, method })
        .catch(() => null);
}
export function svgToImageSrc(svg) {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}
export function svgToCSSBackground(svg) {
    return `url('${svgToImageSrc(svg)}')`;
}
export class StructureImageRenderer {
    constructor() {
        this.title = 'Chemical Structure';
    }
    canRender(col, mode) {
        return col instanceof StructureImageColumn && (mode === ERenderMode.CELL || mode === ERenderMode.GROUP);
    }
    create(col) {
        return {
            template,
            update: (n, d) => {
                var _a;
                if (!renderMissingDOM(n, col, d)) {
                    if ((_a = d.v.images) === null || _a === void 0 ? void 0 : _a[0]) {
                        n.style.backgroundImage = svgToCSSBackground(d.v.images[0]);
                        return null;
                    }
                    const value = col.getValue(d);
                    // Load aysnc to avoid triggering
                    return abortAble(new Promise((resolve) => {
                        window.setTimeout(() => resolve(value), 500);
                    })).then((image) => {
                        var _a;
                        if (typeof image === 'symbol') {
                            return;
                        }
                        n.style.backgroundImage = `url('${getImageURL(value, (_a = col.getFilter()) === null || _a === void 0 ? void 0 : _a.filter, col.getAlign())}')`;
                        n.title = value;
                        n.href = `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
                    });
                }
                return null;
            },
        };
    }
    createGroup(col, context) {
        return {
            template,
            update: (n, group) => {
                context.tasks.groupRows(col, group, 'StructureImageRendererGroup', (rows) => {
                    return abortAble(getReducedImages(Array.from(rows.map((row) => col.getLabel(row))))).then((res) => {
                        n.style.backgroundImage = res ? svgToCSSBackground(res) : '';
                    });
                });
            },
        };
    }
}
//# sourceMappingURL=StructureImageRenderer.js.map