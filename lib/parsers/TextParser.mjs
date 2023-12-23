export class TextParser {
    static getWordAfter(text, word) {
        const matchRegExp = new RegExp(`(^|\\s)${word}`, 'g');
        const match = matchRegExp.exec(text);
        if (match) {
            const index = match.index;
            const after = (match.index === 0)? text.substring(index + word.length) : text.substring(index + word.length + 1);
            const afterTrim = after.trim();
            const firstSpace = afterTrim.indexOf(" ");
            if (firstSpace === -1) {
                return afterTrim;
            }
            return afterTrim.substring(0, firstSpace);
        }
        return null;
    }

    static includesWord(text, word) {
        const matchRegExp = new RegExp(`(^|\\s)${word}`, 'g');
        return matchRegExp.test(text.toLowerCase());
    }

    static getValidTextForLanguage(text, language) {
        if (language === "de") {
            return text.replaceAll(/[^a-z0-9äöüß\s]/gi, "");
        }
        return text.replaceAll(/[^a-z0-9\s]/gi, "");
    }

    static getWordsAfter(text, words) {
        const matchRegExp = new RegExp(`(^|\\s)(${words.join("|")})`, 'g');
        const match = matchRegExp.exec(text);
        if (match) {
            const index = match.index;
            return text.substring(index + match[0].length).trim();
        }
        return null;
    }
}