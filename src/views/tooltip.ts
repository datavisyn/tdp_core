import Popper from 'popper.js';

export class TooltipUtils {

  //based on bootstrap tooltips
  private static readonly template = `<div class="tdp-tooltip" role="tooltip">
    <div></div>
    <div x-arrow></div>
  </div>`;

  private static findTooltip(ensureExists = true) {
    let tooltip = <HTMLElement>document.querySelector(`div.tdp-tooltip`);
    if (!tooltip && ensureExists) {
      tooltip = document.createElement('div'); //helper
      tooltip.innerHTML = TooltipUtils.template;
      tooltip = <HTMLDivElement>tooltip.childNodes[0];
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }

  private static showTooltipAt(tooltip: HTMLElement, reference: HTMLElement | { x: number, y: number }, simpleTooltip: boolean = true) {
    const p: Popper = (<any>tooltip).__popper;
    if (p) {
      p.destroy();
    }
    tooltip.style.display = 'block';
    (<any>tooltip).__popper = new Popper(('x' in <any>reference) && ('y' in <any>reference) ?
      {
        clientHeight: 1,
        clientWidth: 1,
        getBoundingClientRect: () => ({
          top: (<any>reference).y,
          bottom: (<any>reference).y + 1,
          left: (<any>reference).x,
          right: (<any>reference).x + 1,
          height: 1,
          width: 1
        })
      } : <HTMLElement>reference, tooltip, {
      eventsEnabled: false,
      placement: 'top',
      modifiers: simpleTooltip ? {
        preventOverflow:  {
          enabled: false
        },
        hide: {
          enabled: false
        }
      }: {}
    });
  }

  static hideTooltip() {
    const tooltip: HTMLElement = TooltipUtils.findTooltip(false);
    if (tooltip) {
      //hide tooltip
      tooltip.style.display = null;
      const p: Popper = (<any>tooltip).__popper;
      if (p) {
        p.destroy();
      }
    }
  }

  static showTooltip(html: string | HTMLElement | null, reference: HTMLElement | { x: number, y: number }, simpleTooltip: boolean = true) {
    if (!html) {
      return TooltipUtils.hideTooltip();
    }
    const tooltip: HTMLElement = TooltipUtils.findTooltip(true);
    const content = tooltip.querySelector<HTMLElement>('div');

    if (typeof html === 'string') {
      content.innerHTML = html;
    } else {
      content.innerHTML = '';
      content.appendChild(html);
    }
    TooltipUtils.showTooltipAt(tooltip, reference, simpleTooltip);
    return tooltip;
  }

  private static isRelated(evt: MouseEvent, ref: HTMLElement) {
    if (!evt.relatedTarget || !ref) {
      return false;
    }
    let m = <HTMLElement>evt.relatedTarget;
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
  static popOver(html: string | HTMLElement | (() => string | HTMLElement), reference: HTMLElement, coords?: { x: number, y: number }, simpleTooltip: boolean = true) {
    let tooltip: HTMLElement;

    const leave = (evt: MouseEvent) => {
      if (TooltipUtils.isRelated(evt, reference) || TooltipUtils.isRelated(evt, tooltip)) {
        return; // if we switch to the tooltip or vice versa ignore it
      }
      TooltipUtils.hideTooltip();
      tooltip.removeEventListener('mouseleave', leave);
      reference.removeEventListener('mouseleave', leave);
    };

    const enter = (evt: MouseEvent) => {
      if (TooltipUtils.isRelated(evt, reference) || TooltipUtils.isRelated(evt, tooltip)) {
        return; // if we switch to the tooltip or vice versa ignore it
      }
      TooltipUtils.showTooltip(typeof html === 'function' ? html() : html, coords? coords : reference, simpleTooltip);
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
  static generateTooltip<T>(contentGenerator: (items: T[]) => string | HTMLElement, simpleTooltip: boolean = true) {
    let tooltip: HTMLElement;
    return (parent: HTMLElement, items: T[], x: number, y: number, event: MouseEvent) => {
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
      tooltip = <HTMLElement>TooltipUtils.showTooltip(contentGenerator(items), {x: bb.left + x, y: bb.top + y}, simpleTooltip);
      tooltip.addEventListener('mouseleave', TooltipUtils.hideTooltip);
    };
  }
}
