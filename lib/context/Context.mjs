export class Context {
    static generate() {
        return {
            history: [],
            assistant: {
                name: "Botanika",
                language: "en"
            },
            user: {
                name: "User",
                language: "en"
            }
        };
    }

    static callContextFunction(context, functionName, parameters) {
        const functionDefinition = Context.getOpenAiToolFunctions().find(f => f.function.name === functionName);
        if (functionDefinition) {
            switch (functionName) {
                case "modifyContext":
                    const field = parameters.field;
                    const value = parameters.value;
                    return {
                        context: Context.modifyContext(context, field, value),
                        description: `Modified context.${field} to ${value}`
                    };
            }
        }
    }

    static modifyContext(context, field, value) {
        const fieldParts = field.split(".");
        if (fieldParts.length === 2) {
            context[fieldParts[0]][fieldParts[1]] = value;
        }
        return context;
    }

    static getMessageHistory(context) {
        return context.history.map(h => {
            if (h.type === "assistant-response") {
                return {role: "assistant", content: h.text};
            } else if (h.type === "system-response") {
                return {role: "system", content: h.text};
            } else if (h.type === "user-input") {
                return {role: "user", content: h.text};
            }
        });
    }

    static getOpenAiToolFunctions() {
        return [
            {
                type: "function",
                function: {
                    name: "modifyContext",
                    description: "Modify some context property.",
                    parameters: {
                        type: "object",
                        properties: {
                            field: {
                                type: "string",
                                description: "The field to modify. Can be 'assistant.name', 'assistant.language', 'user.name' or 'user.language' or any other field that seems appropriate."
                            },
                            value: {
                                type: "string",
                                description: "The value to set."
                            }
                        },
                        required: ["field", "value"]
                    }
                },
            }
        ]
    }
}