import {EventHandler, IEventHandler, IEventListener} from '../base/event';
import {Range, RangeLike, ParseRangeUtils} from '../range';
import {SelectOperation, SelectionUtils} from './SelectionUtils';
import {IDType} from './IDType';

export interface ISelectAble extends IEventHandler {
  ids(range?: RangeLike): Promise<Range>;

  fromIdRange(idRange?: RangeLike): Promise<Range>;

  readonly idtypes: IDType[];

  selections(type?: string): Promise<Range>;

  select(range: RangeLike): Promise<Range>;
  select(range: RangeLike, op: SelectOperation): Promise<Range>;
  select(type: string, range: RangeLike): Promise<Range>;
  select(type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
  select(dim: number, range: RangeLike): Promise<Range>;
  select(dim: number, range: RangeLike, op: SelectOperation): Promise<Range>;
  select(dim: number, type: string, range: RangeLike): Promise<Range>;
  select(dim: number, type: string, range: RangeLike, op: SelectOperation): Promise<Range>;

  /**
   * clear the specific selection (type) and dimension
   */
  clear(): Promise<any>;
  clear(type: string): Promise<any>;
  clear(dim: number): Promise<any>;
  clear(dim: number, type: string): Promise<any>;
}

interface ISingleSelectionListener {
  (event: any, type: string, act: Range, added: Range, removed: Range): void;
}

export abstract class ASelectAble extends EventHandler implements ISelectAble {
  static readonly EVENT_SELECT = IDType.EVENT_SELECT;

  private numSelectListeners = 0;
  private selectionListeners: ISingleSelectionListener[] = [];
  private singleSelectionListener = async (event: any, type: string, act: Range, added: Range, removed: Range) => {
    const ids = await this.ids();
    //filter to the right ids and convert to indices format
    //given all ids convert the selected ids to the indices in the data type
    act = ids.indexOf(act);
    added = ids.indexOf(added);
    removed = ids.indexOf(removed);
    if (act.isNone && added.isNone && removed.isNone) {
      return;
    }
    //ensure the right number of dimensions
    SelectionUtils.fillWithNone(act, ids.ndim);
    SelectionUtils.fillWithNone(added, ids.ndim);
    SelectionUtils.fillWithNone(removed, ids.ndim);

    this.fire(ASelectAble.EVENT_SELECT, type, act, added, removed);
    this.fire(`${ASelectAble.EVENT_SELECT}-${type}`, act, added, removed);
  }
  private selectionCache: {act: Range, added: Range, removed: Range}[] = [];
  private accumulateEvents = -1;

  abstract ids(range?: RangeLike): Promise<Range>;

  async fromIdRange(idRange: RangeLike = Range.all()) {
    return (await this.ids()).indexOf(ParseRangeUtils.parseRangeLike(idRange));
  }

  get idtypes(): IDType[] {
    return [];
  }

  private selectionListener(idtype: IDType, index: number, total: number) {
    return (event: any, type: string, act: Range, added: Range, removed: Range) => {
      this.selectionCache[index] = {act, added, removed};
      if (this.accumulateEvents < 0 || (++this.accumulateEvents) === total) {
        this.fillAndSend(type, index);
      }
    };
  }

  private fillAndSend(type: string, trigger: number) {
    const ids = this.idtypes;
    const full = ids.map((id, i) => {
      const entry = this.selectionCache[i];
      if (entry) {
        return entry;
      }
      return {
        act: id.selections(type),
        added: Range.none(),
        removed: Range.none()
      };
    });

    const act = Range.join(full.map((entry) => entry.act));
    const added = Range.join(full.map((entry) => entry.added));
    const removed = Range.join(full.map((entry) => entry.removed));

    this.selectionCache = [];
    this.accumulateEvents = -1; //reset
    this.singleSelectionListener(null, type, act, added, removed);
  }

  on(events: string|{[key: string]: IEventListener}, handler?: IEventListener) {
    if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
      this.numSelectListeners++;
      if (this.numSelectListeners === 1) {
        const idt = this.idtypes;
        if (idt.length === 1) {
          this.selectionListeners.push(this.singleSelectionListener);
          idt[0].on(ASelectAble.EVENT_SELECT, this.singleSelectionListener);
        } else {
          idt.forEach((idtype, i) => {
            const s = this.selectionListener(idtype, i, idt.length);
            this.selectionListeners.push(s);
            idtype.on(ASelectAble.EVENT_SELECT, s);
          });
        }
      }
    }
    return super.on(events, handler);
  }

  off(events: string|{[key: string]: IEventListener}, handler?: IEventListener) {
    if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
      this.numSelectListeners--;
      if (this.numSelectListeners === 0) {
        this.idtypes.forEach((idtype, i) => idtype.off(ASelectAble.EVENT_SELECT, this.selectionListeners[i]));
        this.selectionListeners = [];
      }
    }
    return super.off(events, handler);
  }

  async selections(type = SelectionUtils.defaultSelectionType) {
    const ids = await this.ids();
    const r = Range.join(this.idtypes.map((idtype) => idtype.selections(type)));
    return ids.indexRangeOf(r);
  }

  select(range: RangeLike): Promise<Range>;
  select(range: RangeLike, op: SelectOperation): Promise<Range>;
  select(type: string, range: RangeLike): Promise<Range>;
  select(type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
  select(dim: number, range: RangeLike): Promise<Range>;
  select(dim: number, range: RangeLike, op: SelectOperation): Promise<Range>;
  select(dim: number, type: string, range: RangeLike): Promise<Range>;
  select(dim: number, type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
  select() {
    const a = Array.from(arguments);
    const dim = (typeof a[0] === 'number') ? +a.shift() : -1,
      type = (typeof a[0] === 'string') ? a.shift() : SelectionUtils.defaultSelectionType,
      range = ParseRangeUtils.parseRangeLike(a[0]),
      op = SelectionUtils.asSelectOperation(a[1]);
    return this.selectImpl(range, op, type, dim);
  }

  private async selectImpl(range: Range, op = SelectOperation.SET, type: string = SelectionUtils.defaultSelectionType, dim = -1): Promise<Range> {
    const types = this.idtypes;
    let ids = await this.ids();

    if (dim === -1) {
      range = ids.preMultiply(range);
      this.accumulateEvents = 0;
      const r = Range.join(range.split().map((r, i) => types[i].select(type, r, op)));
      if (this.accumulateEvents > 0) { //one event has not been fires, so do it manually
        this.fillAndSend(type, -1);
      }
      while (r.ndim < types.length) {
        r.dim(r.ndim); //create intermediate ones
      }
      return ids.indexRangeOf(r);
    } else {
      //just a single dimension
      ids = ids.split()[dim];
      range = ids.preMultiply(range);
      types[dim].select(type, range, op);
      return ids.indexRangeOf(range);
    }
  }

  /**
   * clear the specific selection (type) and dimension
   */
  clear(): Promise<any>;
  clear(type: string): Promise<any>;
  clear(dim: number): Promise<any>;
  clear(dim: number, type: string): Promise<any>;
  clear() {
    const a = Array.from(arguments);
    const dim = (typeof a[0] === 'number') ? +a.shift() : -1;
    const type = (typeof a[0] === 'string') ? a[0] : SelectionUtils.defaultSelectionType;
    return this.selectImpl(Range.none(), SelectOperation.SET, type, dim);
  }
}
