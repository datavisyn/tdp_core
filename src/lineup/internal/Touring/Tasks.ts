import {MethodManager, ISimilarityMeasure, MeasureMap, intersection, Comparison, Type, SCOPE} from 'touring';


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
  
  public scope: SCOPE;
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