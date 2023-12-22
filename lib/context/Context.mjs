export class Context {
    static generate(user) {
        return {
            history: [],
            modified: false,
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

    static updateGeneral(context) {
        context.general.todaysDate = new Date().toLocaleDateString();
        context.general.conversationStart = new Date().toLocaleTimeString();
        context.general.dayOfTheWeek = new Date().toLocaleDateString("en", {weekday: "long"});
        return context;
    }

    static callContextFunction(context, functionName, parameters) {
        const functionDefinition = Context.getOpenAiToolFunctions().find(f => f.function.name === functionName);
        if (functionDefinition) {
            switch (functionName) {
                case "saveInfo":
                    const field = parameters.field;
                    const value = parameters.value;
                    return {
                        context: Context.modifyContext(context, field, value),
                        description: `Saved ${field}: ${value}`
                    };
            }
        }
    }

    static modifyContext(context, field, value) {
        const fieldParts = field.split(".");
        if (fieldParts.length === 2) {
            context[fieldParts[0]][fieldParts[1]] = value;
            context.modified = true;
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
                    name: "saveInfo",
                    description: "Saves the given information to the user's profile.",
                    parameters: {
                        type: "object",
                        properties: {
                            field: {
                                type: "string",
                                description: "The field to modify. Can be 'assistant.name', 'assistant.language', 'user.name' or 'user.language' or any other field that seems appropriate like 'user.favoriteCar', 'user.birthday'."
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