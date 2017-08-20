/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {AView, EViewMode, IViewContext, ISelection} from '../views';
import LineUp, {ILineUpConfig} from 'lineupjs/src/lineup';
import Column, {IColumnDesc} from 'lineupjs/src/model/Column';
import {deriveColors} from 'lineupjs/src/';
import {ScaleMappingFunction, Ranking} from 'lineupjs/src/model';
import CompositeColumn from 'lineupjs/src/model/CompositeColumn';
import ValueColumn from 'lineupjs/src/model/ValueColumn';
import NumberColumn from 'lineupjs/src/model/NumberColumn';
import {IBoxPlotData} from 'lineupjs/src/model/BoxPlotColumn';
import {LocalDataProvider,} from 'lineupjs/src/provider';
import {resolve, IDType, IDTypeLike} from 'phovea_core/src/idtype';
import {clueify, withoutTracking} from './internal/cmds';
import {saveNamedSet} from '../storage';
import {showErrorModalDialog} from '../Dialogs';
import LineUpRankingButtons from './internal/LineUpRankingButtons';
import LineUpSelectionHelper, {array_diff, set_diff} from './internal/LineUpSelectionHelper';
import IScore, {IScoreRow, createAccessor} from './IScore';
import {stringCol, createInitialRanking, IAdditionalColumnDesc, categoricalCol, numberCol2} from './desc';
import {pushScoreAsync} from './internal/scorecmds';
import {ISelect2Option} from '../form';
import {mixin} from 'phovea_core/src';
import {extent} from 'd3';
import LineUpColors from './internal/LineUpColors';
import {IRow} from './interfaces';
import {ARankingView, IARankingViewOptions} from './ARankingView';


export abstract class ASelectionRankingView extends ARankingView {

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent, options);
  }

  protected selectionChanged() {
    super.selectionChanged();
    this.handleSelectionColumns(this.selection);
  }

  protected parameterChanged() {
    const selectedIds = this.selection.range.dim(0).asList();
    this.addDynamicColumns(selectedIds);
    this.removeDynamicColumns(selectedIds);
  }

  protected handleSelectionColumns(selection: ISelection) {
    if (!this.built) {
      return;
    }
    this.built.then(() => this.handleSelectionColumnsImpl(selection));
  }

  private addDynamicColumns(ids: number[]) : void {
    const ranking = this.provider.getLastRanking();
    const usedCols = ranking.flatColumns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);
    const dynamicColumnIDs = new Set<string>(usedCols.map((col) => `${(<IAdditionalColumnDesc>col.desc).selectedId}_${(<IAdditionalColumnDesc>col.desc).selectedSubtype}`));

    ids.forEach((id) => {
      this.getSelectionColumnDesc(id)
        .then((columnDesc) => {
          // add multiple columns
          const addColumn = (desc: IAdditionalColumnDesc, newColumnPromise: Promise<IScoreRow<any>[]>, id: number) => {
            //mark as lazy loaded
            (<any>desc).lazyLoaded = true;
            this.addColumn(desc, newColumnPromise, id);
          };
          if (Array.isArray(columnDesc)) {
            if (columnDesc.length > 0) {
              // Save which columns have been added for a specific element in the selection
              const selectedElements = new Set<string>(columnDesc.map((desc) => `${id}_${desc.selectedSubtype}`));

              // Check which items are new and should therefore be added as columns
              const addedParameters = set_diff(selectedElements, dynamicColumnIDs);

              if (addedParameters.size > 0) {
                // Filter the descriptions to only leave the new columns and load them
                const columnsToBeAdded = columnDesc.filter((desc) => addedParameters.has(`${id}_${desc.selectedSubtype}`));
                const newColumns: any = this.loadSelectionColumnData(id, columnsToBeAdded);

                // add new columns
                newColumns.then((dataPromise) => {
                  this.withoutTracking(() => {
                    columnsToBeAdded.forEach((desc, i) => {
                      addColumn(desc, dataPromise[i], id);
                    });
                  });
                });
              }
            }
          } else { // single column
            this.withoutTracking(() => {
              addColumn(columnDesc, <Promise<IScoreRow<any>[]>>this.loadSelectionColumnData(id), id);
            });
          }
        });
    });
  }

  private removeDynamicColumns(ids: number[], removeAll: boolean = false) : void {
    const ranking = this.provider.getLastRanking();

    this.withoutTracking(() => {
      if (removeAll) {
        ids.forEach((id) => {
          const usedCols = ranking.flatColumns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId === id);

          usedCols.forEach((col) => ranking.remove(col));
          this.colors.freeColumnColor(id);
        });
      } else {
        const selectedOptions = this.loadDynamicColumnOptions();
        if (selectedOptions.length === 0) {
          ids.forEach((id) => this.colors.freeColumnColor(id));
        }
        // get currently selected subtypes
        const selectedElements = new Set<string>(selectedOptions.map((option) => option.id));

        const usedCols = ranking.flatColumns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);

        // get available all current subtypes from lineup
        const dynamicColumnSubtypes = new Set<string>(usedCols.map((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype));

        // check which parameters have been removed
        const removedParameters = set_diff(dynamicColumnSubtypes, selectedElements);

        if (removedParameters.size > 0) {
          removedParameters.forEach((param) => {
            const cols = usedCols.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedSubtype === param);
            cols.forEach((col) => ranking.remove(col));
          });
        }
      }
    });
  }

  protected loadDynamicColumnOptions() : ISelect2Option[] {
    return [];
  }

  protected handleSelectionColumnsImpl(selection: ISelection) {
    if(this.options.disableAddingColumns) {
      return;
    }

    const selectedIds = selection.range.dim(0).asList();

    const ranking = this.provider.getLastRanking();
    const usedCols = ranking.flatColumns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId !== -1);
    const lineupColIds = usedCols
      .map((d) => (<IAdditionalColumnDesc>d.desc).selectedId)
      .filter((d) => d !== undefined);

    // compute the difference
    const diffAdded = array_diff(selectedIds, lineupColIds);
    const diffRemoved = array_diff(lineupColIds, selectedIds);

    // add new columns to the end
    if (diffAdded.length > 0) {
      //console.log('add columns', diffAdded);
      this.addDynamicColumns(diffAdded);
    }

    // remove deselected columns
    if (diffRemoved.length > 0) {
        //console.log('remove columns', diffRemoved);
      this.removeDynamicColumns(diffRemoved, true);
    }
  }

  protected getSelectionColumnId(id: number): string {
    // hook
    return `col_${id}`;
  }

  protected getSelectionColumnLabel(id: number): Promise<string> {
    // hook
    return Promise.resolve(`Selection ${id}`);
  }

  protected loadSelectionColumnData(id: number, desc?: any): Promise<IScoreRow<any>[]>|Promise<IScoreRow<any>[]>[] {
    // hook
    return Promise.resolve([]);
  }

  protected async getSelectionColumnDesc(id): Promise<any|any[]> {
    const label = await this.getSelectionColumnLabel(id);
    return stringCol(this.getSelectionColumnId(id), label, true, 50, id);
  }
}

export default ARankingView;
