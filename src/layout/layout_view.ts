import {ILayoutElem} from './layout';
import {PluginRegistry} from '../app/PluginRegistry';
import {IPluginDesc} from '../base/plugin';
import {IDataType} from '../data/datatype';
import {IDType} from '../idtype';
import {EventHandler, IEventHandler} from '../base/event';
import {Rect} from '../geom';


export interface IViewDesc extends IPluginDesc {
  /**
   * view type. support, main
   * default: main
   */
  readonly type: string; //support, main
  /**
   * view location: left, top, bottom, right, center
   * default: center
   */
  readonly location: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface PHOVEA_CORE_IView extends ILayoutElem, IEventHandler {
  readonly data: IDataType[];
  readonly idtypes: IDType[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export abstract class PHOVEA_CORE_AView extends EventHandler implements PHOVEA_CORE_IView {
  private _layoutOptions: any = {};

  abstract setBounds(x: number, y: number, w: number, h: number): Promise<void>|any;

  abstract getBounds(): Rect;

  get data(): IDataType[] {
    return [];
  }

  get idtypes(): IDType[] {
    return [];
  }

  setLayoutOption(name: string, value: any) {
    this._layoutOptions[name] = value;
  }

  layoutOption<T>(name: string, defaultValue: T = null): T {
    if (this._layoutOptions.hasOwnProperty(name)) {
      return this._layoutOptions[name];
    }
    return defaultValue;
  }
  static list() {
    return PluginRegistry.getInstance().listPlugins('view').map(convertDesc);
  }
}

function convertDesc(desc: IPluginDesc): IViewDesc {
  const d = <any>desc;
  d.type = d.type || 'main';
  d.location = d.location || 'center';
  return d;
}


