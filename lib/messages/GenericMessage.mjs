export class GenericMessage {
    type = 'generic';
    text = 'Generic message';
    properties = [];

    constructor(type, text) {
        this.type = type;
        this.text = text;
    }

    addProperty(name, value) {
        this.properties.push({
            name,
            value
        });
    }

    addProperties(properties) {
        this.properties = this.properties.concat(properties);
    }
}