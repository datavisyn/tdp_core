/**
 * basic interface of a plugin
 */
export interface IPluginDesc {
    /**
     * type of plugin, a name by convention for identifying different plugin types
     */
    readonly type: string;
    /**
     * name of the plugin, should be unique within a type
     */
    readonly id: string;
    /**
     * human readable name of this plugin
     */
    readonly name: string;
    /**
     * version of this plugin
     * @default 1.0
     */
    readonly version: string;
    /**
     * optional description of this plugin   *
     */
    readonly description: string;
    /**
     * name of the method, which is the entry point of this plugin
     * options:
     *  * `<factorymethod>` the name of the factory method to use
     *  * `new <classname>` will create a new instance of the given class
     *  * `new` will create an instance of the default exported class of this module, same as `new default`
     * @default create
     */
    readonly factory: string;
    /**
     * function for loading this plugin
     * @returns a promise for the loaded plugin
     */
    load(): Promise<IPlugin>;
    /**
     * anything custom
     */
    readonly [key: string]: any;
}
/**
 * basic plugin element
 */
export interface IPlugin {
    /**
     * underlying plugin description
     */
    readonly desc: IPluginDesc;
    /**
     * link to the referenced method as described in the description
     */
    factory(...args: any[]): any;
}
export interface IRegistry {
    push(type: string, loader: () => any, desc?: any): void;
    push(type: string, id: string, loader: () => any, desc?: any): void;
    push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any): void;
}
