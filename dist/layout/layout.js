import { Rect } from '../geom';
export class ALayoutElem {
    constructor(options = {}) {
        this.options = options;
    }
    getBounds() {
        return Rect.rect(0, 0, 0, 0);
    }
    getLocation() {
        return this.getBounds().xy;
    }
    getSize() {
        return this.getBounds().size;
    }
    layoutOption(name, defaultValue = null) {
        if (this.options.hasOwnProperty(name)) {
            return this.options[name];
        }
        return defaultValue;
    }
}
class HTMLLayoutElem extends ALayoutElem {
    constructor(node, options = {}) {
        super(options);
        this.node = node;
    }
    setBounds(x, y, w, h) {
        const unit = this.layoutOption('unit', 'px');
        const { style } = this.node;
        style.left = x + unit;
        style.top = y + unit;
        style.width = w + unit;
        style.height = h + unit;
        return null;
    }
    getBounds() {
        const unit = this.layoutOption('unit', 'px');
        const { style } = this.node;
        function v(f) {
            if (f.length >= unit.length && f.substring(f.length - unit.length) === unit) {
                f = f.substring(0, f.length - unit.length);
                return parseFloat(f);
            }
            return 0;
        }
        return Rect.rect(v(style.left), v(style.top), v(style.width), v(style.height));
    }
    static wrapDOM(node, options = {}) {
        return new HTMLLayoutElem(node, options);
    }
}
//# sourceMappingURL=layout.js.map