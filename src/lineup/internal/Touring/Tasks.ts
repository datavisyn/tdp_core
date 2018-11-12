import {LocalDataProvider, IColumnDesc, ICategory, Column, Ranking, IDataRow} from 'lineupjs';
import {MethodManager, ISimilarityMeasure, MeasureMap, intersection, Comparison, Type, SCOPE} from 'touring';
import * as d3 from 'd3';
import {RankingAdapter} from './TouringPanel';
import {IServerColumn} from 'tdp_core/src/rest';


export const Tasks = new Array<ATouringTask>();
export function TaskDecorator() {
  return function (target: {new(): ATouringTask}) { // only instantiable subtypes of ATouringTask can be passed.
    Tasks.push(new target());
  };
}


export interface ITouringTask {
  id: string;
  label: string;
  
  scope: SCOPE; //  Attributes or subsets of them?
}

export abstract class ATouringTask implements ITouringTask{
  public id: string;
  public label: string;
  public node: HTMLElement;
  
  public scope: SCOPE;

  ranking: RankingAdapter;

  public init(ranking: RankingAdapter, node: HTMLElement) {
    this.ranking = ranking;
    this.node = d3.select(node).append('div').attr('class', `task ${this.id}`).node() as HTMLElement;
    this.initContent();
  }
  
  initContent() {
    d3.select(this.node).append('h3').text(this.label+':');
  }

  public update(data: any[]) {
      const ps = d3.select(this.node).selectAll('p').data(data, (data) => data.column); //column property is key
    
      ps.enter().append('p').text((attr) => attr.label); //enter: add tasks to dropdown
      // update: nothing to do
      ps.exit().remove();   // exit: remove tasks no longer displayed
      ps.order();           // order domelements as in the array
  }
}

@TaskDecorator()
export class ColumnComparison extends ATouringTask {

  constructor() {
    super();
    this.id = "attrCmp";
    this.label = "Pairwise compare columns";

    this.scope = SCOPE.ATTRIBUTES;
  }

  initContent() {
    const tablesEnter = d3.select(this.node)
    .append('div').attr('class', 'table-container')
    .append('table').attr('class', 'table table-condensed');
    tablesEnter
      .append('thead').append('tr').append('th')
    tablesEnter
      .append('tbody');
  }

  public update(data: any[]) {
    const colHeads = d3.select(this.node).select('thead tr').selectAll('th.head').data(data, (d) => d.column); // column is key
    colHeads.enter().append('th').attr('class', 'head');
    
    const node = this.node; // for the function below
    function updateTableBody(bodyData: Array<Array<any>>) {
      const trs = d3.select(node).select('tbody').selectAll('tr').data(bodyData, (d) => d[0]);
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d); // remove 
      tds.enter().append('td');
      // Set colheads in thead 
      colHeads.text((d) => d.label);
      // set data in tbody
      tds.html((d) => d === null ? '<i class="fa fa-circle-o-notch fa-spin"></i>' : (Number(d) ? d.toFixed(2) : d));
  
      // Exit
      colHeads.exit().remove(); // remove attribute columns
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
    }
    
    this.getAttrTableBody(data, data, true).then(updateTableBody); // initialize
    this.getAttrTableBody(data, data, false).then(updateTableBody); // set values
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  private async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean): Promise<Array<Array<any>>> {
    const data = new Array(attr2.length); // n2 arrays (rows) 
    for (let i of data.keys()) {
      data[i] = new Array(attr1.length + 1).fill(null) // containing n1+1 elements (header + n1 vlaues)
      data[i][0] = attr2[i].label;
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      for (let [i, row] of data.entries()) {
        for (let j of row.keys()) {
          if (j > 0) {
            const measures = MethodManager.getMeasuresByType(attr1[j - 1].type, attr2[i].type, SCOPE.ATTRIBUTES); 
            if (measures.length > 0 && j <= i+1) { // start at 
              const measure = measures[0]// Always the first
              const data1 = this.ranking.getAttributeDataDisplayed((attr1[j - 1]as IServerColumn).column) //minus one because the first column is headers
              const data2 = this.ranking.getAttributeDataDisplayed((attr2[i] as IServerColumn).column);
              promises.push(measure.calc(data1, data2)
                .then((score) => row[j] = score)  // TODO call updateTable here?
                .catch((err) => row[j] = Number.NaN)
              ); // if you 'await' here, the calculations are done sequentially, rather than parallel. so store the promises in an array
            } else {
              row[j] = ''; // empty (not null, because null will display spinning wheel)
            }
          }
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }
}

// No decorator as i don't want it in the dropdown 
export abstract class RowComparison extends ATouringTask {

  constructor() {
    super();
    this.id = "itemCmp";
    this.label = "Pairwise compare rows";

    this.scope = SCOPE.SETS;
  }
}

@TaskDecorator()
export class SelectionCategoryComparison extends RowComparison{

  constructor() {
    super();
    this.id = "selCatCmp";
    this.label = "Compare selected rows with column categories"
  }
}

@TaskDecorator()
export class SelectionStratificationComparison extends RowComparison{

  constructor() {
    super();
    this.id = "selStratCmp";
    this.label = "Compare selected rows with stratification groups"
  }
}