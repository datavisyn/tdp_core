import {list} from 'phovea_core/src/plugin';
import {EXTENSION_POINT_TDP_TOUR, ITDPTourExtensionDesc} from './extensions';

export default class Tour {
  constructor(private readonly desc: ITDPTourExtensionDesc) {

  }

  get name() {
    return this.desc.name;
  }
}

export function resolveTours() {
  const tours = <ITDPTourExtensionDesc[]>list(EXTENSION_POINT_TDP_TOUR);

  return tours.map((d) => new Tour(d));
}
