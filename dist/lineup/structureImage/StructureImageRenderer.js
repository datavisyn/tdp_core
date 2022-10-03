import { ERenderMode, renderMissingDOM, } from 'lineupjs';
import { abortAble } from 'lineupengine';
import { StructureImageColumn } from './StructureImageColumn';
import { I18nextManager } from '../../i18n';
const template = '<a target="_blank" rel="noopener" style="background-size: contain; background-position: center; background-repeat: no-repeat;"></a>';
function getImageURL(structure, substructure = null, align = null) {
    return `/api/rdkit/?structure=${encodeURIComponent(structure)}${substructure ? `&substructure=${encodeURIComponent(substructure)}` : ''}${align ? `&align=${encodeURIComponent(align)}` : ''}`;
}
async function fetchImage({ url, data, method }) {
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
        throw Error((await response.json().catch(() => null))?.message || response.statusText);
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
        this.title = I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.structureImage.rendererTitle');
    }
    canRender(col, mode) {
        return col instanceof StructureImageColumn && (mode === ERenderMode.CELL || mode === ERenderMode.GROUP);
    }
    create(col) {
        return {
            template,
            update: (n, d) => {
                if (!renderMissingDOM(n, col, d)) {
                    if (d.v.images?.[0]) {
                        n.style.backgroundImage = svgToCSSBackground(d.v.images[0]);
                        return null;
                    }
                    const value = col?.getValue(d);
                    // Load aysnc to avoid triggering
                    return abortAble(new Promise((resolve) => {
                        window.setTimeout(() => resolve(value), 500);
                    })).then((image) => {
                        if (typeof image === 'symbol') {
                            return;
                        }
                        n.style.backgroundImage = `url('${getImageURL(value, col.getFilter()?.filter, col.getAlign())}')`;
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