export class GenericIntent {
    static name = "generic";

    static isIntended(text) {
        return false;
    }

    static async execute(text, context) {
        return [];
    }

    static isDisabled() {
        return false;
    }
}