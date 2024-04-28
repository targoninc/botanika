import {create} from "https://fjs.targoninc.com/f.js";
import {Emojis} from "./EmojiList.mjs";

const getEmoji = (tag) => {
    tag = tag.replaceAll(" ", "-").replaceAll("_", "-");

    const perfectMatch = Emojis.find(emoji => emoji.tags.includes(tag));
    if (perfectMatch) {
        return perfectMatch;
    }

    const partialMatch = Emojis.find(emoji => emoji.tags.some(t => t.includes(tag)));
    if (partialMatch) {
        return partialMatch;
    }

    const words = tag.split("_");
    for (const word of words) {
        const match = Emojis.find(emoji => emoji.tags.includes(word));
        if (match) {
            return match;
        }
    }

    for (const emoji of Emojis) {
        for (const alias of emoji.tags) {
            const otherAlias = alias.replaceAll("-", "");
            if (otherAlias.includes(tag) || tag.includes(otherAlias)) {
                return emoji;
            }
        }
    }

    const closestMatch = Emojis.reduce((acc, emoji) => {
        const distance = emoji.tags.reduce((acc, t) => {
            const d = levenshtein(tag, t);
            return d < acc ? d : acc;
        }, Infinity);
        if (distance < acc.distance) {
            return {distance, emoji};
        }
        return acc;
    });
    if (closestMatch.distance < 5) {
        return closestMatch.emoji;
    }

    return null;
}

const levenshtein = (a, b) => {
    const matrix = [];

    const aLength = a.length;
    const bLength = b.length;

    if (aLength === 0) {
        return bLength;
    } else if (bLength === 0) {
        return aLength;
    }

    for (let i = 0; i <= bLength; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= aLength; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= bLength; i++) {
        for (let j = 1; j <= aLength; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
            }
        }
    }

    return matrix[bLength][aLength];
}

const renderEmoji = (emoji) => {
    return create("picture")
        .classes("emoji")
        .children(
            create("source")
                .attributes("srcset", `https://fonts.gstatic.com/s/e/notoemoji/latest/${emoji.codepoint}/512.webp`)
                .type("type", "image/webp")
                .build(),
            create("img")
                .src(`https://fonts.gstatic.com/s/e/notoemoji/latest/${emoji.codepoint}/512.gif`)
                .alt(emoji.tags[0])
                .width(32)
                .height(32)
                .build()
        ).build();
}

export const emoji = (tag) => {
    console.log(tag);
    const emoji = getEmoji(tag);
    if (!emoji) {
        return create("span").text(tag).build();
    }
    console.log(emoji);
    return renderEmoji(emoji);
}
