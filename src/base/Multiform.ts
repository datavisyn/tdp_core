import {IMultiForm} from '../multiform';
import {IObjectRef, ICmdResult, ActionMetaData, ObjectRefUtils, ProvenanceGraph} from '../provenance';
import {IVisInstance, ITransform} from '../vis';

const disabled = {};

export class Multiform {

  static transform(inputs: IObjectRef<any>[], parameter: any): ICmdResult {
    const v: IVisInstance = inputs[0].value,
      transform = parameter.transform,
      bak = parameter.old || v.transform();

    disabled['transform-' + v.id] = true;
    v.transform(transform.scale, transform.rotate);
    delete disabled['transform-' + v.id];
    return {
      inverse: Multiform.createTransform(inputs[0], bak, transform)
    };
  }
  static createTransform(v: IObjectRef<IVisInstance>, t: ITransform, old: ITransform = null) {
    return {
      meta: ActionMetaData.actionMeta('transform ' + v.toString(), ObjectRefUtils.category.visual),
      id: 'transform',
      f: Multiform.transform,
      inputs: [v],
      parameter: {
        transform: t,
        old
      }
    };
  }

  static changeVis(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult> {
    const v: IMultiForm = inputs[0].value,
      to: string = parameter.to,
      from = parameter.from || v.act.id;
    disabled['switch-' + v.id] = true;
    return v.switchTo(to).then(() => {
      delete disabled['switch-' + v.id];
      return {
        inverse: Multiform.createChangeVis(inputs[0], from, to)
      };
    });
  }
  static createChangeVis(v: IObjectRef<IMultiForm>, to: string, from: string = null) {
    return {
      meta: ActionMetaData.actionMeta('switch vis ' + v.toString(), ObjectRefUtils.category.visual),
      id: 'changeVis',
      f: Multiform.changeVis,
      inputs: [v],
      parameter: {
        to,
        from
      }
    };
  }

  static setOption(inputs: IObjectRef<any>[], parameter: any): ICmdResult {
    const v: IVisInstance = inputs[0].value,
      name = parameter.name,
      value = parameter.value,
      bak = parameter.old || v.option(name);
    disabled['option-' + v.id] = true;
    v.option(name, value);
    delete disabled['option-' + v.id];
    return {
      inverse: Multiform.createSetOption(inputs[0], name, bak, value)
    };
  }

  static createSetOption(v: IObjectRef<IVisInstance>, name: string, value: any, old: any = null) {
    return {
      meta: ActionMetaData.actionMeta('set option "' + name + +'" of "' + v.toString() + ' to "' + value + '"', ObjectRefUtils.category.visual),
      id: 'setOption',
      f: Multiform.setOption,
      inputs: [v],
      parameter: {
        name,
        value,
        old
      }
    };
  }

  static attach(graph: ProvenanceGraph, v: IObjectRef<IVisInstance>) {
    const m = v.value, id = m.id;
    if (typeof ((<any>m).switchTo) === 'function') {
      m.on('changed', (event, newValue, old) => {
        if (disabled['switch-' + id] !== true) {
          console.log('push switch');
          graph.push(Multiform.createChangeVis(<IObjectRef<IMultiForm>>v, newValue.id, old ? old.id : null));
        }
      });
    }
    m.on('transform', (event, newValue, old) => {
      if (disabled['transform-' + id] !== true) {
        console.log('push transform');
        graph.push(Multiform.createTransform(v, newValue, old));
      }
    });
    m.on('option', (event, name, newValue, old) => {
      if (disabled['option-' + id] !== true) {
        console.log('push option');
        graph.push(Multiform.createSetOption(v, name, newValue, old));
      }
    });
  }
}
