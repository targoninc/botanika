export class ToolBuilder {
    constructor(type, name) {
        if (type === "function") {
            this.tool = {
                type: "function",
                function: {
                    name
                }
            };
        }
    }

    static function(name) {
        return new ToolBuilder("function", name);
    }

    description(description) {
        this.tool.function.description = description;
        return this;
    }

    parameters(parameters) {
        this.tool.function.parameters = parameters;
        return this;
    }
}

