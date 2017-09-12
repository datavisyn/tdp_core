/**
 * Created by sam on 13.02.2017.
 */

import {Ranking} from 'lineupjs/src/model';
import * as d3 from 'd3';
import {IDType} from 'phovea_core/src/idtype';
import {list as listPlugins} from 'phovea_core/src/plugin';
import {IRankingButtonExtensionDesc, EXTENSION_POINT_TDP_RANKING_BUTTON} from '../../extensions';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';
import * as $ from 'jquery';
import {ALineUpActions} from './ALineUpActions';

export default class LineUpButtonActions extends ALineUpActions {

  private readonly $ul: d3.Selection<HTMLUListElement>;

  constructor(provider: ADataProvider, private readonly $node: d3.Selection<any>, idType: () => IDType, extraArgs: object|(() => object)) {
    super(provider, idType, extraArgs);

    this.$ul = this.$node.append('ul').classed('tdp-button-group', true);

    this.appendDownload();
    this.appendSaveRanking();
    this.appendMoreColumns();
    this.appendExtraButtons();
  }

  private createMarkup(title: string, linkClass: string = '', linkListener: (param: any) => void | null, liClass: string = '') {
    const $li = this.$ul.append('li')
      .classed(liClass, liClass.length > 0);

    $li.append('a')
      .attr('title', title)
      .attr('href', '#')
      .classed(linkClass, linkClass .length > 0)
      .on('click', linkListener);

    return $li;
  }

  private appendDownload() {
    const listener = (ranking: Ranking) => {
      this.exportRanking(ranking, <ADataProvider>this.provider);
    };

    this.createMarkup('Export Data', 'fa fa-download', listener);
  }

  private appendSaveRanking() {
    const listener = (ranking: Ranking) => {
      (<Event>d3.event).preventDefault();
      (<Event>d3.event).stopPropagation();

      this.saveRankingDialog(ranking.getOrder());
    };

    this.createMarkup('Save Named Set', 'fa fa-save', listener);
  }


  private async appendMoreColumns() {
    const $dropdownLi = this.createMarkup('Add Column', 'fa fa-plus dropdown-toggle', null, 'dropdown');

    $dropdownLi.select('a')
      .attr('data-toggle', 'dropdown');

    const $selectWrapper = $dropdownLi.append('div').attr('class', 'dropdown-menu');

    const chooser = await this.createChooser(<HTMLElement>$selectWrapper.node(), () => {
      // close dropdown after selection
      $($dropdownLi.select('.dropdown-toggle').node()).dropdown('toggle');
    });

    // HACK: don't close the dropdown when the dropdown itself or Select2 is clicked
    $selectWrapper.on('click', () => (<Event>d3.event).stopPropagation());

    $($dropdownLi.node()).on('shown.bs.dropdown', () => {
      // show Select2 options by default when the dropdown is visible to have Select2 calculate the correct position
      chooser.focus();

      // HACK: keep dropdown open even when the input element inside Select2 is clicked
      // this EventListener can only be applied when the dropdown is shown, because otherwise the element does not exist
      $('.select2-search__field').on('click', (e) => e.stopPropagation());
    });
  }

  private appendExtraButtons() {
    const buttons = <IRankingButtonExtensionDesc[]>listPlugins(EXTENSION_POINT_TDP_RANKING_BUTTON);
    buttons.forEach((button) => {
      const listener = () => {
        (<Event>d3.event).preventDefault();
        (<Event>d3.event).stopPropagation();
        button.load().then((p) => this.scoreColumnDialog(p));
      };
      this.createMarkup(button.name,'fa ' + button.cssClass, listener);
    });
  }
}
