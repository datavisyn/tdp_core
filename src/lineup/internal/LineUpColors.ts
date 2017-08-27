import Ranking from 'lineupjs/src/model/Ranking';
import {scale} from 'd3';

export default class LineUpColors {
  /**
   * Map that assigns each selection ID a color, which is used as color for columns
   */
  private readonly colorMap = new Map<number, string>();
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
      color = this.colors.shift();
      this.colorMap.set(id, color);
    } else {
      color = this.colorMap.get(id);
    }
    return color;
  }

  freeColumnColor(id: number): void {
    const color = this.colorMap.get(id);
    if (color) {
      this.colorMap.delete(id);
      if (this.colors.indexOf(color) === -1) {
        this.colors.push(color);
      }
    }
  }
}
