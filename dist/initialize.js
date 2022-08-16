import { PluginRegistry } from './app';
import { i18n } from './i18n';
import reg from './phovea';
/**
 * Initializes all dependencies of the library. This is required when using it as standalone library, i.e. without any application initializing it.
 */
export async function initializeLibrary() {
    // Register just tdp_core
    PluginRegistry.getInstance().register('tdp_core', reg);
    await i18n.initI18n();
}
//# sourceMappingURL=initialize.js.map