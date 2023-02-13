import { Ajax } from './ajax';
/**
 * Loads the client config from '/clientConfig.json' and parses it.
 */
export async function loadClientConfig() {
    return Ajax.getJSON('/clientConfig.json').catch((e) => {
        console.error('Error parsing clientConfig.json', e);
        return null;
    });
}
//# sourceMappingURL=clientConfig.js.map