export class Context {
    static generate(user) {
        return {
            history: [],
            assistant: {
                name: "Botanika",
                language: "en"
            },
            user: {
                name: user.displayname || "User",
                language: user.language || "en",
                email: user.email,
                description: user.description
            },
            general: {
                todaysDate: new Date().toLocaleDateString(),
                conversationStart: new Date().toLocaleTimeString(),
                dayOfTheWeek: new Date().toLocaleDateString("en", {weekday: "long"}),
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
        const lastCount = 10;
        return context.history.map(h => {
            if (h.type === "assistant-response") {
                return {role: "assistant", content: h.text};
            } else if (h.type === "system-response") {
                return {role: "system", content: h.text};
            } else if (h.type === "user-message") {
                return {role: "user", content: h.text};
            }
        }).filter(h => h).slice(-lastCount);
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