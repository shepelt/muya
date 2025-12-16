const rendererCache = new Map();

// Stub renderer for removed diagram types - returns placeholder
const stubRenderer = {
    render: async () => '<div class="diagram-unsupported">Diagram rendering not available (use server-side rendering)</div>',
};

/**
 *
 * @param {string} name the renderer name:plantuml, mermaid, vega-lite
 */
async function loadRenderer(name: string) {
    if (!rendererCache.has(name)) {
        switch (name) {
            case 'plantuml':
            case 'mermaid':
            case 'vega-lite':
                // These renderers have been removed to reduce bundle size
                // Consider using server-side rendering for these diagram types
                console.warn(`Diagram type "${name}" is not available client-side`);
                rendererCache.set(name, stubRenderer);
                break;

            default:
                throw new Error(`Unknown diagram name ${name}`);
        }
    }

    return rendererCache.get(name);
}

export default loadRenderer;
