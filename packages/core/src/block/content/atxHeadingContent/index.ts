import type { Muya } from '../../../muya';
import type { ICursor } from '../../../selection/types';
import type AtxHeading from '../../commonMark/atxHeading';
import Format from '../../base/format';
import { ScrollPage } from '../../scrollPage';

class AtxHeadingContent extends Format {
    public override parent: AtxHeading | null = null;

    static override blockName = 'atxheading.content';

    static create(muya: Muya, text: string) {
        const content = new AtxHeadingContent(muya, text);

        return content;
    }

    constructor(muya: Muya, text: string) {
        super(muya, text);
        this.classList = [...this.classList, 'mu-atxheading-content'];
        this.createDomNode();
    }

    override getAnchor() {
        return this.parent;
    }

    override update(cursor?: ICursor, highlights = []) {
        return this.inlineRenderer.patch(this, cursor, highlights);
    }

    override enterHandler(event: Event) {
        event.preventDefault();
        const { start, end } = this.getCursor()!;
        const { level } = this.parent!.meta;
        const { text: oldText, muya } = this;

        // Case 1: Cursor at or before the heading prefix (e.g., at or before "## ")
        // Insert empty paragraph before heading, keep cursor in heading
        if (start.offset === end.offset && start.offset <= level + 1) {
            const newNodeState = {
                name: 'paragraph',
                text: '',
            };

            const newParagraphBlock = ScrollPage.loadBlock(newNodeState.name).create(
                muya,
                newNodeState,
            );
            this.parent!.parent!.insertBefore(newParagraphBlock, this.parent);
            this.setCursor(start.offset, end.offset, true);
        }
        // Case 2: Cursor in the middle or at end of heading text
        // Split: keep prefix + text before cursor as heading, text after cursor becomes paragraph
        else {
            // Text after cursor becomes new paragraph (no prefix)
            const textOfNewNode = oldText.substring(end.offset);

            // Keep prefix + text before cursor in the heading
            this.text = oldText.substring(0, start.offset);

            const newParagraphState = {
                name: 'paragraph',
                text: textOfNewNode,
            };

            const newNode = ScrollPage.loadBlock(newParagraphState.name).create(
                muya,
                newParagraphState,
            );

            this.parent!.parent!.insertAfter(newNode, this.parent);

            // Update the heading with truncated text
            this.update();

            // Move cursor to start of new paragraph
            const cursorBlock = newNode.firstContentInDescendant();
            cursorBlock.setCursor(0, 0, true);
        }
    }

    override backspaceHandler(event: Event) {
        const { start, end } = this.getCursor()!;
        if (start.offset === 0 && end.offset === 0) {
            event.preventDefault();
            this.text = this.text.replace(/^ {0,3}#{1,6} */, '');
            this.convertToParagraph();
        }
        else if (start.offset === 1 && end.offset === 1 && this.text === '#') {
            event.preventDefault();
            this.text = '';
            this.setCursor(0, 0);
            this.convertToParagraph();
        }
        else {
            super.backspaceHandler(event);
        }
    }
}

export default AtxHeadingContent;
