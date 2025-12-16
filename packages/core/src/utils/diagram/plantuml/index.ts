// Stubbed - plantuml-encoder removed to reduce bundle size
export default class Diagram {
    public encodedInput = '';

    static parse(_input: string) {
        console.warn('PlantUML rendering not available client-side');
        return new Diagram();
    }

    encode(_value: string) {
        // No-op
    }

    insertImgElement(container: string | HTMLElement) {
        const div
            = typeof container === 'string'
                ? document.getElementById(container)
                : container;
        if (div === null || !div.tagName)
            throw new Error(`Invalid container: ${container}`);

        div.innerHTML = '<div class="diagram-unsupported">PlantUML not available (use server-side rendering)</div>';
    }
}
