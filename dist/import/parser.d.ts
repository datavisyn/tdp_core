/**
 * Created by Samuel Gratzl on 29.09.2016.
 */
export interface IParseResult {
    data: any;
    meta: any;
}
export interface ICSVParsingOptions {
    header?: boolean;
    delimiter?: string;
    newline?: string;
}
export declare class ParserUtils {
    /**
     * parses the given csv file/blob using PapaParse
     * @param data
     * @param options additional options
     * @return {Promise<R>|Promise}
     */
    static parseCSV(data: any, options?: ICSVParsingOptions): Promise<IParseResult>;
    static streamCSV(data: any, chunk: (chunk: IParseResult) => any, options?: ICSVParsingOptions): Promise<IParseResult>;
}
