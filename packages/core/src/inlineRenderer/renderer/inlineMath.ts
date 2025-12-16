// Stubbed - KaTeX removed to reduce bundle size
import type { CodeEmojiMathToken, ISyntaxRenderOptions } from '../types';
import type Renderer from './index';
import { CLASS_NAMES } from '../../config';

export default function inlineMath(this: Renderer, {
    h,
    cursor,
    block,
    token,
    outerClass,
}: ISyntaxRenderOptions & { token: CodeEmojiMathToken }) {
    const className = this.getClassName(outerClass, block, token, cursor);
    const mathSelector
        = className === CLASS_NAMES.MU_HIDE
            ? `span.${className}.${CLASS_NAMES.MU_MATH}`
            : `span.${CLASS_NAMES.MU_MATH}`;

    const { start, end } = token.range;
    const { marker } = token;

    const startMarker = this.highlight(
        h,
        block,
        start,
        start + marker.length,
        token,
    );
    const endMarker = this.highlight(h, block, end - marker.length, end, token);
    const content = this.highlight(
        h,
        block,
        start + marker.length,
        end - marker.length,
        token,
    );

    const { content: math } = token;

    // Show raw math text instead of rendered KaTeX
    const mathVnode = math;
    const previewSelector = `span.${CLASS_NAMES.MU_MATH_RENDER}`;

    return [
        h(`span.${className}.${CLASS_NAMES.MU_MATH_MARKER}`, startMarker),
        h(mathSelector, [
            h(
                `span.${CLASS_NAMES.MU_INLINE_RULE}.${CLASS_NAMES.MU_MATH_TEXT}`,
                {
                    attrs: { spellcheck: 'false' },
                },
                content,
            ),
            h(
                previewSelector,
                {
                    attrs: { contenteditable: 'false' },
                    style: { fontFamily: 'monospace', background: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' },
                    dataset: {
                        start: String(start + 1),
                        end: String(end - 1),
                    },
                },
                mathVnode,
            ),
        ]),
        h(`span.${className}.${CLASS_NAMES.MU_MATH_MARKER}`, endMarker),
    ];
}
