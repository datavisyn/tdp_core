import * as d3v3 from 'd3v3';
import { merge } from 'lodash';
import { ParserUtils } from './parser';
import { ValueTypeEditor } from './valuetype/valuetypes';
import { ImportUtils } from './ImportUtils';
import { EventHandler } from 'visyn_core/base';
export class Importer extends EventHandler {
    constructor(parent, options = {}) {
        super();
        this.options = {
            type: 'table',
        };
        merge(this.options, options);
        this.$parent = d3v3.select(parent).append('div').classed('caleydo-importer', true);
        this.build(this.$parent);
    }
    selectedFile(file) {
        let { name } = file;
        name = name.substring(0, name.lastIndexOf('.')); // remove .csv
        Promise.all([ParserUtils.parseCSV(file), ValueTypeEditor.createValueTypeEditors()]).then((results) => {
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
    build($root) {
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
    static createImporter(parent, options = {}) {
        return new Importer(parent, options);
    }
    static selectFileLogic($dropZone, $files, onFileSelected, overCssClass = 'over') {
        function over() {
            const e = d3v3.event;
            e.stopPropagation();
            e.preventDefault();
            const s = e.target.classList;
            if (e.type === 'dragover') {
                s.add(overCssClass);
            }
            else {
                s.remove(overCssClass);
            }
        }
        function select() {
            over();
            const e = d3v3.event;
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
//# sourceMappingURL=Importer.js.map