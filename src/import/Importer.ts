import * as d3v3 from 'd3v3';
import { merge } from 'lodash';
import { ParserUtils } from './parser';
import { ValueTypeEditor } from './valuetype/valuetypes';
import { ImportUtils } from './ImportUtils';
import { EventHandler } from '../base';
import { IDataDescription } from '../data';

export interface IImporterOptions {
  /**
   * type to import: table,matrix
   */
  type?: string;
}

export class Importer extends EventHandler {
  private options: IImporterOptions = {
    type: 'table',
  };

  private $parent: d3v3.Selection<any>;

  private builder: () => { data: any; desc: IDataDescription };

  constructor(parent: Element, options: IImporterOptions = {}) {
    super();
    merge(this.options, options);
    this.$parent = d3v3.select(parent).append('div').classed('caleydo-importer', true);

    this.build(this.$parent);
  }

  private selectedFile(file: File) {
    let { name } = file;
    name = name.substring(0, name.lastIndexOf('.')); // remove .csv

    Promise.all([<any>ParserUtils.parseCSV(file), ValueTypeEditor.createValueTypeEditors()]).then((results) => {
      const editors = results[1];
      const { data } = results[0];
      const header = data.shift();

      switch (this.options.type) {
        case 'matrix':
          ImportUtils.importMatrix(editors, this.$parent, header, data, name).then((b) => {
            this.builder = b;
          });
          break;
        default:
          ImportUtils.importTable(editors, this.$parent, header, data, name).then((b) => {
            this.builder = b;
          });
          break;
      }
    });
  }

  private build($root: d3v3.Selection<any>) {
    $root.html(`
      <div class="drop-zone">
        <input type="file" id="importer-file" />
      </div>
    `);

    Importer.selectFileLogic($root.select('div.drop-zone'), $root.select('input[type=file]'), this.selectedFile.bind(this));
  }

  getResult() {
    return this.builder ? this.builder() : null;
  }

  static createImporter(parent: Element, options: IImporterOptions = {}) {
    return new Importer(parent, options);
  }

  static selectFileLogic($dropZone: d3v3.Selection<any>, $files: d3v3.Selection<any>, onFileSelected: (file: File) => any, overCssClass = 'over') {
    function over() {
      const e = <Event>(<any>d3v3.event);
      e.stopPropagation();
      e.preventDefault();
      const s = (<HTMLElement>e.target).classList;
      if (e.type === 'dragover') {
        s.add(overCssClass);
      } else {
        s.remove(overCssClass);
      }
    }

    function select() {
      over();
      const e: any = d3v3.event;
      // either drop or file select
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      if (files.length > 0) {
        // just the first file for now
        onFileSelected(files[0]);
      }
    }

    $files.on('change', select);
    $dropZone.on('dragover', over).on('dragleave', over).on('drop', select);
  }
}
