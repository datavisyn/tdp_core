import merge from 'lodash/merge';

import not_available from '../../assets/not_available.png';
import { ProvenanceGraph, StateNode } from '../provenance';

export class ThumbnailUtils {
  static thumbnail_url(graph: ProvenanceGraph, state: StateNode, options = {}) {
    const o = {
      width: 128,
      format: 'jpg',
    };
    merge(o, options);
    if (state.hasAttr('thumbnail')) {
      return state.getAttr('thumbnail');
    }

    // TODO: This feature never worked...
    // const d = <any>graph.desc;
    // if (d.attrs && d.attrs.of && !d.local) {
    //   return AppContext.getInstance().api2absURL(`/clue/thumbnail${d.attrs.of}/${graph.desc.id}/${state.id}.${o.format}`, {
    //     width: o.width,
    //   });
    // }
    return not_available;
  }

  static areThumbnailsAvailable(graph: ProvenanceGraph) {
    const d = <any>graph.desc;
    return d.attrs && d.attrs.of && !d.local;
  }
}
