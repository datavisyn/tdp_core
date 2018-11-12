import {MethodManager, ISimilarityMeasure, MeasureMap, intersection, Comparison, Type, SCOPE} from 'touring';
import * as d3 from 'd3';

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

  public init(node: HTMLElement) {
    this.node = d3.select(node).append('div').attr('class', `task ${this.id}`).node() as HTMLElement;
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