import {CLI} from "../CLI.mjs";
import {MessageTypes} from "./MessageTypes.mjs";

export class Context {
    static generate(user, sessionId) {
        return {
            history: [],
            assistant: {
                name: "Botanika",
                language: "en",
                muted: false
            },
            user: {
                name: user.displayname || "User",
                language: user.language || "en",
                email: user.email,
                description: user.description,
                session: sessionId
            },
            general: {
                todaysDate: new Date().toLocaleDateString(),
                conversationStart: new Date().toLocaleTimeString(),
                dayOfTheWeek: new Date().toLocaleDateString("en", {weekday: "long"}),
            },
            apis: {}
        };
    }

    static updateGeneral(context) {
        context.general.todaysDate = new Date().toLocaleDateString();
        context.general.conversationStart = new Date().toLocaleTimeString();
        context.general.dayOfTheWeek = new Date().toLocaleDateString("en", {weekday: "long"});
        return context;
    }

    static callContextFunction(context, functionName, parameters) {
        const functionDefinition = Context.getOpenAiCompatibleToolFunctions().find(f => f.function.name === functionName);
        if (functionDefinition) {
            switch (functionName) {
                case "saveInfo":
                    return {
                        context: Context.modifyContext(context, parameters.field, parameters.value),
                        description: `Saved ${parameters.field}: ${parameters.value}`
                    };
                case "removeInfo":
                    return {
                        context: Context.modifyContext(context, parameters.field, parameters.value),
                        description: `Removed ${parameters.field}: ${parameters.value}`
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
            if (h.type === MessageTypes.assistantResponse) {
                return {role: "assistant", content: h.text};
            } else if (h.type === MessageTypes.systemResponse) {
                return {role: "system", content: h.text};
            } else if (h.type === MessageTypes.userMessage) {
                return {role: "user", content: h.text};
            }
        }).filter(h => h).slice(-lastCount);
    }

    static getOpenAiCompatibleToolFunctions() {
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
                                description: "The value to set. For any languages, use the ISO 639-1 code. For example 'en' for English or 'de' for German."
                            }
                        },
                        required: ["field", "value"]
                    }
                },
            }
        ]
    }

    static checkApiTokens(context) {
        if (context.apis.spotify) {
            if (context.apis.spotify.expires_at < Date.now()) {
                CLI.debug(`Spotify API token expired.`);
                delete context.apis.spotify;
            } else {
                CLI.debug(`Spotify API token still valid.`);
            }
        }
        return context;
    }

    static lastMessageIsType(context, type) {
        return context.history.length > 0 && context.history[context.history.length - 1].type === type;
    }
}