import * as d3 from 'd3';
import { EventHandler } from '../base';
import { IDataDescription } from '../data';
export interface IImporterOptions {
    /**
     * type to import: table,matrix
     */
    type?: string;
}
export declare class Importer extends EventHandler {
    private options;
    private $parent;
    private builder;
    constructor(parent: Element, options?: IImporterOptions);
    private selectedFile;
    private build;
    getResult(): {
        data: any;
        desc: IDataDescription;
    };
    static createImporter(parent: Element, options?: IImporterOptions): Importer;
    static selectFileLogic($dropZone: d3.Selection<any>, $files: d3.Selection<any>, onFileSelected: (file: File) => any, overCssClass?: string): void;
}
//# sourceMappingURL=Importer.d.ts.map