import {EventHandler, GlobalEventHandler} from './event';
import {AppContext} from '../app';
import {IDTypeManager, IDType, SelectionUtils} from '../idtype';
import {IObjectRef, ICmdResult, ActionMetaData, ObjectRefUtils, ActionNode, ProvenanceGraph} from '../provenance';
import {ParseRangeUtils, Range} from '../range';
import {Compression} from './Compression';
import {ResolveNow} from './promise';
import {BaseUtils} from './BaseUtils';


const disabler = new EventHandler();

export class Selection {

  static select(inputs: IObjectRef<any>[], parameter:any, graph, within): ICmdResult {
    const idtype = IDTypeManager.getInstance().resolveIdType(parameter.idtype),
      range = ParseRangeUtils.parseRangeLike(parameter.range),
      type = parameter.type;
    const bak = parameter.old ? ParseRangeUtils.parseRangeLike(parameter.old) : idtype.selections(type);

    if (AppContext.getInstance().hash.has('debug')) {
      console.log('select', range.toString());
    }
    disabler.fire('disable-'+idtype.id);
    idtype.select(type, range);
    disabler.fire('enable-'+idtype.id);

    return Selection.createSelection(idtype, type, bak, range, parameter.animated).then((cmd) => ({ inverse: cmd, consumed : parameter.animated ? within : 0 }));
  }

  static capitalize(s: string) {
    return s.split(' ').map((d) => d[0].toUpperCase()+d.slice(1)).join(' ');
  }

  static meta(idtype: IDType, type:string, range: Range) {
    const l = range.dim(0).length;
    let title = type === SelectionUtils.defaultSelectionType ? '' : (Selection.capitalize(type)+' ');
    let p;
    if (l === 0) {
      title += 'no '+idtype.names;
      p = ResolveNow.resolveImmediately(title);
    } else if (l === 1) {
      title += idtype.name+' ';

      p = idtype.unmap(range).then((r) => {
        title += r[0];
        return title;
      });
    } else if (l < 3) {
      title += idtype.names+' (';
      p = idtype.unmap(range).then((r) => {
        title += r.join(', ') + ')';
        return title;
      });
    } else {
      title += `${range.dim(0).length} ${idtype.names}`;
      p = ResolveNow.resolveImmediately(title);
    }
    return p.then((title) => ActionMetaData.actionMeta(title, ObjectRefUtils.category.selection));
  }

  /**
   * create a selection command
   * @param idtype
   * @param type
   * @param range
   * @param old optional the old selection for inversion
   * @returns {Cmd}
   */
  static createSelection(idtype: IDType, type:string, range: Range, old: Range = null, animated = false) {
    return Selection.meta(idtype, type, range).then((meta) => {
      return {
        meta,
        id: 'select',
        f: Selection.select,
        parameter: {
          idtype: idtype.id,
          range: range.toString(),
          type,
          old: old.toString(),
          animated
        }
      };
    });
  }

  static compressSelection(path: ActionNode[]) {
    return Compression.lastOnly(path, 'select', (p) => p.parameter.idtype + '@' + p.parameter.type);
  }
}

/**
 * utility class to record all the selections within the provenance graph for a specific idtype
 */
class SelectionTypeRecorder {
  private l = (event, type, sel, added, removed, old) => {
    Selection.createSelection(this.idtype, type, sel, old, this.options.animated).then((cmd) => this.graph.push(cmd));
  }

  private _enable = this.enable.bind(this);
  private _disable = this.disable.bind(this);

  private typeRecorders = [];

  constructor(private idtype: IDType, private graph: ProvenanceGraph, private type?:string, private options: any = {}) {

    if (this.type) {
      this.typeRecorders = this.type.split(',').map((ttype) => {
        const t = (event, sel, added, removed, old) => {
          return this.l(event, ttype, sel, added, removed, old);
        };
        return t;
      });
    }
    this.enable();

    disabler.on('enable-'+this.idtype.id, this._enable);
    disabler.on('disable-'+this.idtype.id, this._disable);
  }

  disable() {
    if (this.type) {
      this.type.split(',').forEach((ttype, i) => {
        this.idtype.off('select-' + ttype, this.typeRecorders[i]);
      });
    } else {
      this.idtype.off('select', this.l);
    }
  }

  enable() {
    if (this.type) {
      this.type.split(',').forEach((ttype, i) => {
        this.idtype.on('select-' + ttype, this.typeRecorders[i]);
      });
    } else {
      this.idtype.on('select', this.l);
    }
  }

  destroy() {
    this.disable();
    disabler.off('enable-'+this.idtype.id, this._enable);
    disabler.off('disable-'+this.idtype.id, this._disable);
  }
}
/**
 * utility class to record all the selections within the provenance graph
 */
export class SelectionRecorder {
  private handler:SelectionTypeRecorder[] = [];
  private adder = (event, idtype) => {
    if (this.options.filter(idtype)) {
      this.handler.push(new SelectionTypeRecorder(idtype, this.graph, this.type, this.options));
    }
  }

  constructor(private graph: ProvenanceGraph, private type?:string, private options: any = {}) {
    this.options = BaseUtils.mixin({
      filter: BaseUtils.constantTrue,
      animated: false
    }, this.options);
    GlobalEventHandler.getInstance().on('register.idtype', this.adder);
    IDTypeManager.getInstance().listIdTypes().forEach((d) => {
      this.adder(null, d);
    });
  }

  destroy() {
    GlobalEventHandler.getInstance().off('register.idtype', this.adder);
    this.handler.forEach((h) => h.destroy());
    this.handler.length = 0;
  }

  static createSelectionRecorder(graph:ProvenanceGraph, type?:string, options: any = {}) {
    return new SelectionRecorder(graph, type, options);
  }
}
