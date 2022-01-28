/**
 * This file defines interfaces for various data types and their metadata.
 */

import { BaseUtils } from '../base/BaseUtils';
import { Range1D, Range1DGroup, CompositeRange1D } from '../range';

export interface ICategorical2PartitioningOptions {
  /**
   * name of the partitioning
   * default: 'Partitioning'
   */
  name?: string;
  /**
   * default: true
   */
  skipEmptyCategories?: boolean;
  /**
   * colors for categories, more will be rotated
   * default: ['gray']
   */
  colors?: string[];
  /**
   * labels for categories, need to match exactly
   * default: null
   */
  labels?: string[];
}

export class Categorical2PartioningUtils {
  /**
   * converts the given categorical data to a grouped range
   * @param data
   * @param categories
   * @param options
   * @return {CompositeRange1D}
   */
  static categorical2partitioning<T>(data: T[], categories: T[], options: ICategorical2PartitioningOptions = {}): CompositeRange1D {
    const m: ICategorical2PartitioningOptions = BaseUtils.mixin(
      {
        skipEmptyCategories: true,
        colors: ['gray'],
        labels: null,
        name: 'Partitioning',
      },
      options,
    );

    let groups = categories.map((d, i) => {
      return {
        name: m.labels ? m.labels[i] : d.toString(),
        color: m.colors[Math.min(i, m.colors.length - 1)],
        indices: [],
      };
    });
    data.forEach((d, j) => {
      const i = categories.indexOf(d);
      if (i >= 0) {
        groups[i].indices.push(j);
      }
    });
    if (m.skipEmptyCategories) {
      groups = groups.filter((g) => g.indices.length > 0);
    }
    const granges = groups.map((g) => {
      return new Range1DGroup(g.name, g.color, Range1D.from(g.indices));
    });
    return CompositeRange1D.composite(m.name, granges);
  }
}
