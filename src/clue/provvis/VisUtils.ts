import { PluginRegistry } from 'visyn_core/plugin';
import { IPluginDesc } from '../../base/plugin';
import { IDataType } from '../../data/datatype';
import { IVisPluginDesc } from './IVisPluginDesc';
import { IVisInstance } from './visInstance';

export class VisUtils {
  static extrapolateFilter(r: { filter?: string | ((data: IDataType) => boolean) }) {
    const v = r.filter;
    if (typeof v === 'undefined') {
      r.filter = () => true;
    } else if (typeof v === 'string') {
      r.filter = (data) => data && data.desc.type && data.desc.type.match(v) != null;
    } else if (Array.isArray(v)) {
      r.filter = (data) =>
        data && data && data.desc.type && data.desc.type.match(v[0]) && ((<any>data.desc).value === undefined || (<any>data.desc).value.type.match(v[1]));
    }
  }

  static extrapolateIconify(r: { iconify?(node: HTMLElement): void }) {
    if (typeof r.iconify === 'function') {
      return;
    }
    r.iconify = function iconfiy(this: IVisPluginDesc, node: HTMLElement) {
      node.title = this.name;
      const anyThis = <any>this;
      if (anyThis.iconcss) {
        node.classList.add('phovea-vis-icon');
        node.classList.add(anyThis.iconcss);
      } else if (anyThis.icon) {
        node.classList.add('phovea-vis-icon');
        node.style.width = '1em';
        node.style.display = 'inline-block';
        node.style.textAlign = 'center';
        node.style.backgroundSize = '100%';
        node.style.backgroundRepeat = 'no-repeat';
        // lazy load icon
        anyThis.icon().then((iconData: string) => {
          node.style.backgroundImage = `url(${iconData})`;
        });
        node.innerHTML = '&nbsp';
      } else {
        node.innerText = this.name.substr(0, 1).toUpperCase();
      }
      return node;
    };
  }

  static extrapolateSize(r: { scaling?: string; sizeDependsOnDataDimension: boolean | [boolean, boolean] }) {
    r.scaling = r.scaling || 'free';

    if (Array.isArray(r.sizeDependsOnDataDimension) && typeof r.sizeDependsOnDataDimension[0] === 'boolean') {
      // ok
    } else if (typeof r.sizeDependsOnDataDimension === 'boolean') {
      r.sizeDependsOnDataDimension = [r.sizeDependsOnDataDimension, r.sizeDependsOnDataDimension];
    } else {
      r.sizeDependsOnDataDimension = [false, false];
    }
  }

  static extrapolateRotation(r: { rotation: string | number | null }) {
    const m = {
      // string to text mappings
      free: NaN,
      no: 0,
      transpose: 90,
      swap: 180,
    };
    if (typeof r.rotation === 'string' && r.rotation in m) {
      r.rotation = (<any>m)[r.rotation];
    } else if (typeof r.rotation === 'number') {
      r.rotation = +r.rotation;
    } else if (r.rotation === null) {
      r.rotation = NaN;
    } else {
      r.rotation = 0;
    }
  }

  static toVisPlugin(plugin: IPluginDesc): IVisPluginDesc {
    const r: any = plugin;
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
  static listVisPlugins(data: IDataType): IVisPluginDesc[] {
    // filter additionally with the filter attribute, which can be a function or the expected data type
    return PluginRegistry.getInstance()
      .listPlugins('vis')
      .map(VisUtils.toVisPlugin)
      .filter((desc) => desc.filter(data));
  }

  static assignVis(node: Element, vis: IVisInstance) {
    (<any>node).__vis__ = vis;
  }
}
