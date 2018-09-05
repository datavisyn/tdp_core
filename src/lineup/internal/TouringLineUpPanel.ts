import LineUpPanelActions from './LineUpPanelActions';

export default class TouringLineUpPanel extends LineUpPanelActions {

  private touringElem : HTMLElement;
  private columnOverview : HTMLElement; searchbox : HTMLElement; itemCounter : HTMLElement; // default sidepanel elements
  
  protected init() {
    super.init();
    this.node.insertAdjacentHTML('beforeend', `  <div class="touring" hidden>
    <ul class="nav nav-tabs nav-justified">
      <li class="active"><a href="#itemTouring" data-toggle="tab">Items</a></li>
      <li><a href="#attributeTouring" data-toggle="tab">Attributes</a></li>
    </ul>

    <div class="tab-content">
      <div class="tab-pane active" id="itemTouring">
        <div class="form-inline">
          <label for="compareSrc1">Compare:</label>
          <select class="form-control" id="compareSrc1">
              <option>Selected Rows</option>
              <option>A Int < 0.33 </option>
              <option>0.33 <= A Int <= 0.66</option>
              <option>A Int > 0.66</option>
          </select>
        </div>
        
        <div class="form-inline">
          <label>With:</label>
          <label>
            <input type="radio" name="cmpGroup" value="category" checked> Categories
          </label>
          <label>
            <input type="radio" name="cmpGroup" value="group"> Stratification Groups
          </label>
        </div>
        
        <div class="form-inline">
          <label for="compareSrc2">Of:</label>
          <select class="form-control" id="compareSrc2">
            <option>All displayed attributes</option>
            <option>All categorical attributes</option>
            <option>Selection</option>
            <option>Stratification</option>
            <option>A Cat1</option>
            <option>A Cat2</option>
          </select>
        </div>
        <hr>
        <div>
          <h4>Jaccard Similarity</h1>
          <div class="table-responsive">
            <table class="table table-bordered table-condensed table-hover">
              <tr>
                <th></th>
                <th></th>
                <th>Selected</th>
              </tr>
              <tr>
                <td>A Cat1</td>
                <td>A Cat1</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>A Cat2</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>A Cat3</td>
                <td></td>
              </tr>
              <tr>
                <td>A Cat2</td>
                <td>A CatB 1</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>A CatB 2</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>A CatB 3</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>A CatB 4</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>A CatB 5</td>
                <td></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="tab-pane" id="attributeTouring">
        ,,,
      </div>
    </div>
  </div>`);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');
    
    this.columnOverview = <HTMLElement>this.node.querySelector('main')!;
    this.searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
    this.itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-bar-chart', () => {
      console.log('start touring')
      
      this.toggleTouring();

      // TODO adder as dropdown?
      // TODO restore panel on touring click
    }));
  }

  
  private toggleTouring(hide?: boolean) {
    if(!this.touringElem)
      return; // the elements are undefined

    if (hide === undefined) {
      // if not hidden -> hide
      hide =!this.touringElem.hidden;
    }
    // hide touring -> not hide normal content
    this.searchbox.hidden = !hide;
    this.itemCounter.hidden = !hide;
    this.columnOverview.hidden = !hide;
    
    this.touringElem.hidden = hide;
    if (!hide) {
      //if touring is displayed, ensure the panel is visible
      this.collapse = false;
    }
  }

  get collapse() {
    return this.node.classList.contains('collapsed');
  }
  
  set collapse(value: boolean) {
    this.node.classList.toggle('collapsed', value);
    if (value) {
      // panel gets collapsed, Touring is hidden to ensure the default look when the panel is expanded again.
      this.toggleTouring(true);
    }
  }

}

