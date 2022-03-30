// In case of failing tests due to i18next, check if the `esModuleInterop` flag is set to true in the jest config (in "tsConfig" object under "ts-jest" in globals property).
import i18next from 'i18next';
import { PluginRegistry } from '../app/PluginRegistry';
import { EP_PHOVEA_CORE_LOCALE } from '../app/extensions';
export class I18nextManager {
    constructor() {
        /**
         * Create a unique i18next instance
         * Thus allowing the existence of multiple i18next instances with different configurations
         * without one overwriting the other
         */
        this.i18n = i18next.createInstance();
    }
    /**
     *  Awaits the translation files registered at the EP_PHOVEA_CORE_LOCALE extension point
     *  Initialize I18next with the translation files
     */
    async initI18n() {
        const plugins = await Promise.all(PluginRegistry.getInstance()
            .listPlugins(EP_PHOVEA_CORE_LOCALE)
            .map((pluginDesc) => {
            return pluginDesc.load().then((locale) => {
                return {
                    lng: pluginDesc.lng || I18nextManager.DEFAULT_LANGUAGE,
                    ns: pluginDesc.ns || I18nextManager.DEFAULT_NAMESPACE,
                    resources: locale.factory(),
                    order: pluginDesc.order || 0,
                };
            });
        }));
        return I18nextManager.getInstance()
            .i18n.use({
            type: 'postProcessor',
            name: 'showKeyDebugger',
            process: (value, key, option, translator) => (translator.options.debug ? key : value),
        })
            .init({
            debug: false,
            appendNamespaceToCIMode: true,
            interpolation: {
                escapeValue: true,
                format: (value, format) => {
                    if (format === 'uppercase') {
                        return value.toUpperCase();
                    }
                    if (format === 'lowercase') {
                        return value.toLowerCase();
                    }
                    return value;
                },
            },
            ns: I18nextManager.DEFAULT_NAMESPACE,
            defaultNS: I18nextManager.DEFAULT_NAMESPACE,
            lng: I18nextManager.DEFAULT_LANGUAGE,
            fallbackLng: I18nextManager.DEFAULT_LANGUAGE,
            postProcess: ['showKeyDebugger'],
        })
            .then(() => {
            /* For each plugin add the resources to the i18next configuration
              If plugins have same language and namespace the  one with greater order
              overwrites the others
            */
            plugins
                .sort((pluginA, pluginB) => pluginA.order - pluginB.order)
                .forEach((plugin) => {
                I18nextManager.getInstance().i18n.addResourceBundle(plugin.lng, plugin.ns, plugin.resources, true, true);
            });
        });
    }
    static getInstance() {
        if (!I18nextManager.instance) {
            I18nextManager.instance = new I18nextManager();
        }
        return I18nextManager.instance;
    }
}
I18nextManager.DEFAULT_LANGUAGE = 'en';
I18nextManager.DEFAULT_NAMESPACE = 'default_namespace';
export const i18n = I18nextManager.getInstance();
//# sourceMappingURL=I18nextManager.js.map