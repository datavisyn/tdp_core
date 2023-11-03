import { scale } from 'd3v3';
import { difference } from 'lodash';
export class LineUpColors {
    constructor() {
        /**
         * Map that assigns each selection ID a color, which is used as color for columns
         */
        this.colorMap = new Map();
        this.colors = scale
            .category10()
            .range()
            .concat(scale
            .category20()
            .range()
            .filter((_d, i) => i % 2 === 1));
    }
    getColumnColor(id) {
        if (id == null) {
            id = `${this.colorMap.size}`;
        }
        let color = '';
        if (!this.colorMap.has(id)) {
            const usedColors = Array.from(this.colorMap.values()).map((item) => item.color);
            color = difference(this.colors, usedColors)[0];
            this.colorMap.set(id, { color, items: 1 });
        }
        else {
            const value = this.colorMap.get(id);
            color = value.color;
            value.items++;
        }
        return color;
    }
    freeColumnColor(id) {
        if (this.colorMap.has(id)) {
            const value = this.colorMap.get(id);
            value.items--;
            if (value.items === 0) {
                this.colorMap.delete(id);
            }
        }
    }
    clear() {
        this.colorMap.clear();
    }
}
//# sourceMappingURL=LineUpColors.js.map