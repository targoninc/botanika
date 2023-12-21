export class TextParser {
    static getWordAfter(text, word) {
        const index = text.indexOf(word);
        if (index === -1) {
            return null;
        }
        const after = text.substring(index + word.length).trim();
        const firstSpace = after.indexOf(" ");
        if (firstSpace === -1) {
            return after;
        }
        return after.substring(0, firstSpace);
    }
}