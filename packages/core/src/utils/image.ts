import type { ImageToken } from '../inlineRenderer/types';
import { isWin } from '../config/index';
import { tokenizer } from '../inlineRenderer/lexer';
import { findContentDOM, getOffsetOfParagraph } from '../selection/dom';

export interface IImageInfo {
    token: ImageToken;
    imageId: string;
}

export function getImageInfo(image: HTMLElement): IImageInfo {
    const paragraph = findContentDOM(image)!;
    const raw = image.getAttribute('data-raw')!;
    const offset = getOffsetOfParagraph(image, paragraph);
    const tokens = tokenizer(raw);
    const token = tokens[0] as ImageToken;
    token.range = {
        start: offset,
        end: offset + raw.length,
    };

    return {
        token,
        imageId: image.id,
    };
}

export function getImageSrc(src: string) {
    const EXT_REG = /\.(jpeg|jpg|png|gif|svg|webp)(?=\?|$)/i;
    // http[s] (domain or IPv4 or localhost or IPv6) [port] /not-white-space
    const URL_REG
        = /^http(s)?:\/\/([\w\-.~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:\d{1,5})?\/\S+/i;
    const DATA_URL_REG
        = /^data:image\/[\w+-]+(;[\w-]+=[\w-]+|;base64)*,[a-zA-Z0-9+/]+={0,2}$/;
    const imageExtension = EXT_REG.test(src);
    const isUrl = URL_REG.test(src);

    // Handle HTTP(S) URLs - accept all URLs regardless of extension
    // Let the browser and content-type checks handle validation
    if (isUrl) {
        return {
            isUnknownType: false,
            src,
        };
    }

    // Handle local file paths with extensions
    if (imageExtension) {
        return {
            isUnknownType: false,
            src: `file://${src}`,
        };
    }

    // Handle data URLs
    const isDataUrl = DATA_URL_REG.test(src);
    if (isDataUrl) {
        return {
            isUnknownType: false,
            src,
        };
    }

    // Empty or invalid src
    return {
        isUnknownType: false,
        src: '',
    };
}

export async function loadImage(url: string, detectContentType = false): Promise<{
    url: string;
    width: number;
    height: number;
}> {
    if (detectContentType) {
        const isImage = await checkImageContentType(url);
        if (!isImage)
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject('not an image.');
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve({
                url,
                width: image.width,
                height: image.height,
            });
        };

        image.onerror = (err) => {
            reject(err);
        };
        image.src = url;
    });
}

export async function checkImageContentType(url: string) {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        const contentType = res.headers.get('content-type');

        if (
            contentType
            && res.status === 200
            && /^image\/(?:jpeg|png|gif|svg\+xml|webp)$/.test(contentType)
        ) {
            return true;
        }

        return false;
    }
    catch (err) {
        return false;
    }
}

export function correctImageSrc(src: string) {
    if (src) {
    // Fix ASCII and UNC paths on Windows (#1997).
        if (isWin && /^(?:[a-z]:\\|[a-z]:\/).+/i.test(src)) {
            src = `file:///${src.replace(/\\/g, '/')}`;
        }
        else if (isWin && /^\\\\\?\\.+/.test(src)) {
            src = `file:///${src.substring(4).replace(/\\/g, '/')}`;
        }
        else if (/^\/.+/.test(src)) {
            // Also adding file protocol on UNIX.
            // Do nothing: src = src
        }
    }

    return src;
}
