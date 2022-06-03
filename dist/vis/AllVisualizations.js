const visualizations = [];
export function GetVisualizations() {
    return visualizations;
}
export function CreateVisualization(renderer, initialiteConfig, type, defaultConfig) {
    visualizations.push({
        renderer,
        initialiteConfig,
        type,
        defaultConfig: { ...defaultConfig, type },
    });
    return {
        renderer,
        initialiteConfig,
        type,
        defaultConfig: { ...defaultConfig },
    };
}
//# sourceMappingURL=AllVisualizations.js.map