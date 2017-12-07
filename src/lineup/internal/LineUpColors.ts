import Ranking from 'lineupjs/src/model/Ranking';
import {scale} from 'd3';
import {array_diff} from './LineUpSelectionHelper';

export default class LineUpColors {
  /**
   * Map that assigns each selection ID a color, which is used as color for columns
   */
  private readonly colorMap = new Map<number, {color: string, items: number}>();
  private colors: string[] = scale.category10().range().slice();

  init(ranking: Ranking) {
    const colors = scale.category10().range().slice();
    // remove colors that are already in use from the list
    ranking.flatColumns.forEach((d) => {
      const i = colors.indexOf(d.color);
      if (i > -1) {
        colors.splice(i, 1);
      }
    });
    this.colors = colors;
  }

  getColumnColor(id: number): string {
    if (id < 0) {
      id = this.colorMap.size;
    }

    let color = '';
    if (!this.colorMap.has(id)) {
      const usedColors = Array.from(this.colorMap.values()).map((item) => item.color);
      color = array_diff(this.colors, usedColors)[0];
      this.colorMap.set(id, {color, items: 1});
    } else {
      const value = this.colorMap.get(id);
      color = value.color;
      value.items++;
      this.colorMap.set(id, value);
    }
    return color;
  }

  freeColumnColor(id: number): void {
    const {color} = this.colorMap.get(id);
    let {items} = this.colorMap.get(id);

    if (color) {
      items--;
      if (items === 0) {
        this.colorMap.delete(id);
      } else {
        this.colorMap.set(id, {color, items});
      }
    }
  }
}
