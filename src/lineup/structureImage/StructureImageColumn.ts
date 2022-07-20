import { StringColumn, IDataRow, Column } from 'lineupjs';
import { isEqual } from 'lodash';

export interface IStructureImageFilter {
  /**
   * Search string which is used to filter the column data
   */
  filter: string;

  /**
   * Filter out rows with missing values
   */
  filterMissing: boolean;

  /**
   * The set contains matching results that should be visible
   */
  matching: Set<string>;
}

export class StructureImageColumn extends StringColumn {
  protected structureFilter: IStructureImageFilter | null = null;

  protected align: string | null = null;

  filter(row: IDataRow): boolean {
    if (!this.isFiltered()) {
      return true;
    }

    // filter out row if no valid results found
    if (this.structureFilter.matching === null) {
      return false;
    }

    const rowLabel = this.getLabel(row);

    // filter missing values
    if (rowLabel == null || rowLabel.trim() === '') {
      return !this.structureFilter.filterMissing;
    }

    return this.structureFilter.matching.has(rowLabel) ?? false;
  }

  isFiltered(): boolean {
    return this.structureFilter != null;
  }

  getFilter() {
    return this.structureFilter;
  }

  setFilter(filter: IStructureImageFilter | null) {
    if (isEqual(filter, this.structureFilter)) {
      return;
    }

    // ensure that no filter of the string column is used beyond this point
    // TODO remove once the string filter is removed from the UI
    if (filter && !filter.matching) {
      return;
    }

    this.fire([StringColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.structureFilter, (this.structureFilter = filter));
  }

  getAlign(): string | null {
    return this.align;
  }

  setAlign(structure: string | null): void {
    if (isEqual(structure, this.align)) {
      return;
    }

    this.fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], (this.align = structure));
  }
}
