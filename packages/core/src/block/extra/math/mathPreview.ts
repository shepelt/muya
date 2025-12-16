// Stubbed - KaTeX removed to reduce bundle size
import type { Muya } from '../../../muya';
import type { IMathBlockState, TState } from '../../../state/types';
import { fromEvent } from 'rxjs';
import logger from '../../../utils/logger';
import Parent from '../../base/parent';

const debug = logger('mathPreview:');

class MathPreview extends Parent {
    public math: string;

    static override blockName = 'math-preview';

    static create(muya: Muya, state: IMathBlockState) {
        const mathBlock = new MathPreview(muya, state);

        return mathBlock;
    }

    override get path() {
        debug.warn('You can never call `get path` in htmlPreview');
        return [];
    }

    constructor(muya: Muya, { text }: IMathBlockState) {
        super(muya);
        this.tagName = 'div';
        this.math = text;
        this.classList = ['mu-math-preview'];
        this.attributes = {
            spellcheck: 'false',
            contenteditable: 'false',
        };
        this.createDomNode();
        this.attachDOMEvents();
        this.update();
    }

    override getState(): TState {
        debug.warn('You can never call `getState` in mathPreview');
        return {} as TState;
    }

    attachDOMEvents() {
        const clickObservable = fromEvent(this.domNode!, 'click');
        clickObservable.subscribe(this.clickHandler.bind(this));
    }

    clickHandler(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const cursorBlock = this.parent!.firstContentInDescendant();
        cursorBlock?.setCursor(0, 0);
    }

    update(math = this.math) {
        if (this.math !== math)
            this.math = math;

        const { i18n } = this.muya;

        if (math) {
            // Show raw math in a styled container (KaTeX rendering disabled)
            this.domNode!.innerHTML = `<div class="mu-math-raw" style="font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto;"><code>${this.escapeHtml(math)}</code></div>`;
        }
        else {
            this.domNode!.innerHTML = `<div class="mu-empty">&lt; ${i18n.t(
                'Empty Mathematical Formula',
            )} &gt;</div>`;
        }
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

export default MathPreview;
