export class ToolParameter {
    constructor() {
        this.parameter = {
            type: "object"
        };
    }

    static object() {
        return new ToolParameter();
    }

    property(name, type, description) {
        if (!this.parameter.properties) {
            this.parameter.properties = {};
        }
        this.parameter.properties[name] = {
            type,
            description
        };
        return this;
    }

    required(name) {
        if (!this.parameter.required) {
            this.parameter.required = [];
        }
        this.parameter.required.push(name);
        return this;
    }
}