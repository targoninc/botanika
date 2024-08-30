export class GenericIntent {
    static name = "generic";

    static getTool() {
        return null;
    }

    static async execute(text, context) {
        return [];
    }

    static isDisabled() {
        return false;
    }
}