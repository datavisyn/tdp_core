/**
 * Created by sam on 28.10.2016.
 */

import { TDP_SCATTERPLOT_CSS_PREFIX } from './constants';

export class ScatterplotTooltipUtils {
  // based on bootstrap tooltips
  static readonly template = `<div class="${TDP_SCATTERPLOT_CSS_PREFIX}-tooltip" role="tooltip">
    <div></div>
    <div></div>
  </div>`;

  static findTooltip(parent: HTMLElement, ensureExists = true) {
    let tooltip = <HTMLElement>parent.querySelector(`div.${TDP_SCATTERPLOT_CSS_PREFIX}-tooltip`);
    if (!tooltip && ensureExists) {
      tooltip = document.createElement('div'); // helper
      tooltip.innerHTML = ScatterplotTooltipUtils.template;
      tooltip = <HTMLDivElement>tooltip.childNodes[0];
      parent.appendChild(tooltip);
    }
    return tooltip;
  }

  static showTooltipAt(tooltip: HTMLElement, x: number, y: number) {
    tooltip.style.display = 'block';
    tooltip.style.left = `${x - tooltip.clientWidth / 2}px`;
    tooltip.style.top = `${y - tooltip.clientHeight}px`;
  }

  static toString(d: any) {
    if (typeof d.toString === 'function') {
      const s = d.toString();
      if (s !== '[object Object]') {
        return s;
      }
    }
    return JSON.stringify(d);
  }

  /**
   * @internal
   */
  static showTooltip(parent: HTMLElement, items: any[], x: number, y: number) {
    const tooltip: HTMLElement = ScatterplotTooltipUtils.findTooltip(parent, items.length > 0);
    if (items.length === 0) {
      if (tooltip) {
        // hide tooltip
        tooltip.style.display = '';
      }
      return;
    }
    const content = <HTMLElement>tooltip.querySelector('div');
    content.innerHTML = `<pre>${items.map(toString).join('\n')}</pre>`;

    ScatterplotTooltipUtils.showTooltipAt(tooltip, x, y);
  }
}
