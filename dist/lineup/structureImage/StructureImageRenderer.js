import { ERenderMode, renderMissingDOM, } from 'lineupjs';
import { abortAble } from 'lineupengine';
import { StructureImageColumn } from './StructureImageColumn';
import { I18nextManager } from '../../i18n';
const template = '<a target="_blank" rel="noopener" style="background-size: contain; background-position: center; background-repeat: no-repeat;"></a>';
function getImageURL(structure, substructure = null, align = null) {
    return `/api/rdkit/?structure=${encodeURIComponent(structure)}${substructure ? `&substructure=${encodeURIComponent(substructure)}` : ''}${align ? `&align=${encodeURIComponent(align)}` : ''}`;
}
async function fetchImage({ url, data, method }) {
    var _a;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        // mode: '*cors', // no-cors, *cors, same-origin
        method,
        redirect: 'follow',
        ...(data
            ? {
                body: JSON.stringify(data),
            }
            : {}),
    });
    if (!response.ok) {
        throw Error(((_a = (await response.json().catch(() => null))) === null || _a === void 0 ? void 0 : _a.message) || response.statusText);
    }
    return response.text();
}
async function getReducedImages(structures) {
    // maximum common substructure
    if (structures.length > 2) {
        return fetchImage({ url: '/api/rdkit/mcs/', data: structures, method: 'POST' });
    }
    // similarity
    if (structures.length === 2) {
        const reference = structures[0];
        const probe = structures.length > 1 ? structures[1] : structures[0];
        return fetchImage({ url: `/api/rdkit/similarity/?structure=${encodeURIComponent(probe)}&reference=${encodeURIComponent(reference)}`, method: 'GET' });
    }
    // single = first structure
    return fetchImage({ url: `/api/rdkit/?structure=${encodeURIComponent(structures[0])}`, method: 'GET' });
}
function svgToImageSrc(svg) {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}
function svgToCSSBackground(svg) {
    return `url('${svgToImageSrc(svg)}')`;
}
export class StructureImageRenderer {
    constructor() {
        this.title = I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.structuredImage.rendererTitle');
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
                    const value = col === null || col === void 0 ? void 0 : col.getValue(d);
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
    createSummary() {
        // no renderer
        return {
            template: `<div></div>`,
            update: () => { },
        };
    }
}
//# sourceMappingURL=StructureImageRenderer.js.map