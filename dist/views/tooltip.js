import Popper from 'popper.js';
class TooltipUtils {
    static findTooltip(ensureExists = true) {
        let tooltip = document.querySelector(`div.tdp-tooltip`);
        if (!tooltip && ensureExists) {
            tooltip = document.createElement('div'); // helper
            tooltip.innerHTML = TooltipUtils.template;
            tooltip = tooltip.childNodes[0];
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }
    static showTooltipAt(tooltip, reference, simpleTooltip = true) {
        const p = tooltip.__popper;
        if (p) {
            p.destroy();
        }
        tooltip.style.display = 'block';
        tooltip.__popper = new Popper('x' in reference && 'y' in reference
            ? {
                clientHeight: 1,
                clientWidth: 1,
                getBoundingClientRect: () => ({
                    x: reference.x,
                    y: reference.y,
                    top: reference.y,
                    bottom: reference.y + 1,
                    left: reference.x,
                    right: reference.x + 1,
                    height: 1,
                    width: 1,
                    toJSON: () => {
                        throw new Error('TS4 migration required this');
                    },
                }),
            }
            : reference, tooltip, {
            eventsEnabled: false,
            placement: 'top',
            modifiers: simpleTooltip
                ? {
                    preventOverflow: {
                        enabled: false,
                    },
                    hide: {
                        enabled: false,
                    },
                }
                : {},
        });
    }
    static hideTooltip() {
        const tooltip = TooltipUtils.findTooltip(false);
        if (tooltip) {
            // hide tooltip
            tooltip.style.display = null;
            const p = tooltip.__popper;
            if (p) {
                p.destroy();
            }
        }
    }
    static showTooltip(html, reference, simpleTooltip = true) {
        if (!html) {
            return TooltipUtils.hideTooltip();
        }
        const tooltip = TooltipUtils.findTooltip(true);
        const content = tooltip.querySelector('div');
        if (typeof html === 'string') {
            content.innerHTML = html;
        }
        else {
            content.innerHTML = '';
            content.appendChild(html);
        }
        TooltipUtils.showTooltipAt(tooltip, reference, simpleTooltip);
        return tooltip;
    }
    static isRelated(evt, ref) {
        if (!evt.relatedTarget || !ref) {
            return false;
        }
        let m = evt.relatedTarget;
        while (m) {
            if (m === ref) {
                return true;
            }
            m = m.parentElement;
        }
        return false;
    }
    /**
     * similar to a tooltip but the hiding and showing will be done automatically
     * @param {string | null} html
     * @param {HTMLElement} reference
     * @param { number, number } coords
     */
    static popOver(html, reference, coords, simpleTooltip = true) {
        let tooltip;
        const leave = (evt) => {
            if (TooltipUtils.isRelated(evt, reference) || TooltipUtils.isRelated(evt, tooltip)) {
                return; // if we switch to the tooltip or vice versa ignore it
            }
            TooltipUtils.hideTooltip();
            tooltip.removeEventListener('mouseleave', leave);
            reference.removeEventListener('mouseleave', leave);
        };
        const enter = (evt) => {
            if (TooltipUtils.isRelated(evt, reference) || TooltipUtils.isRelated(evt, tooltip)) {
                return; // if we switch to the tooltip or vice versa ignore it
            }
            TooltipUtils.showTooltip(typeof html === 'function' ? html() : html, coords || reference, simpleTooltip);
            tooltip = TooltipUtils.findTooltip(true);
            tooltip.addEventListener('mouseleave', leave);
            reference.addEventListener('mouseleave', leave);
        };
        reference.addEventListener('mouseenter', enter);
    }
    /**
     * similar to a tooltip but the hiding and showing will be done automatically
     * @param {(items: T[]) => string} contentGenerator
     */
    static generateTooltip(contentGenerator, simpleTooltip = true) {
        let tooltip;
        return (parent, items, x, y, event) => {
            const hide = items.length <= 0;
            if (hide) {
                // hide the tooltip if it exists and the user does not move the mouse into the tolltip, otherwise leave the tooltip
                if (tooltip && !TooltipUtils.isRelated(event, tooltip)) {
                    TooltipUtils.hideTooltip();
                    tooltip.removeEventListener('mouseleave', null);
                    tooltip = null;
                }
                return;
            }
            const bb = parent.getBoundingClientRect();
            tooltip = TooltipUtils.showTooltip(contentGenerator(items), { x: bb.left + x, y: bb.top + y }, simpleTooltip);
            tooltip.addEventListener('mouseleave', TooltipUtils.hideTooltip);
        };
    }
}
// based on bootstrap tooltips
TooltipUtils.template = `<div class="tdp-tooltip" role="tooltip">
    <div></div>
    <div x-arrow></div>
  </div>`;
export { TooltipUtils };
//# sourceMappingURL=tooltip.js.map