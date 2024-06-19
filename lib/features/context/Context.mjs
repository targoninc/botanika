import {CLI} from "../../tooling/CLI.mjs";
import {MessageTypes} from "../../MessageTypes.mjs";
import {SpotifyApi} from "../spotify/api/SpotifyApi.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

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

    static callModifyContext(context, functionName, parameters) {
        return {
            result: Context.modifyContext(context, parameters.field, parameters.value),
            description: `Modified ${parameters.field}: ${parameters.value}`
        };
    }

    static modifyContext(context, field, value) {
        const fieldParts = field.split(".");
        if (fieldParts.length === 2) {
            if (context[fieldParts[0]][fieldParts[1]] !== value) {
                context[fieldParts[0]][fieldParts[1]] = value;
                return {
                    modified: true,
                    context
                };
            } else {
                return {
                    modified: false,
                    context
                };
            }
        } else {
            return {
                modified: false,
                context
            };
        }
    }

    static getMessageHistory(context, length = 10) {
        return context.history.map(h => {
            if (h.type === MessageTypes.assistantResponse) {
                return {role: "assistant", content: h.text};
            } else if (h.type === MessageTypes.systemResponse) {
                return {role: "system", content: h.text};
            } else if (h.type === MessageTypes.userMessage) {
                return {role: "user", content: h.text};
            }
        }).filter(h => h).slice(-length);
    }

    static getMessageHistoryWithOnlyLastUserMessage(context) {
        const history = Context.getMessageHistory(context);
        const userMessages = history.filter(h => h.role === "user");
        return history.filter(h => !userMessages.includes(h));
    }

    static getToolFunction() {
        return ToolBuilder.function("modifyInfo")
            .description("Modifies the given information in the user's profile. Only modify if the given data is different, new or no longer valid compared to the context data.")
            .parameters(ToolParameter.object()
                .property("field", "string", "The field to modify. Can be 'assistant.name', 'assistant.language', 'user.name' or 'user.language' or any other field that seems appropriate.")
                .property("value", "string", "The value to set. For any languages, use the ISO 639-1 code.")
                .required("field", "value")
                .parameter
            ).tool;
    }

    static async checkApiTokens(context) {
        if (context.apis.spotify) {
            if (context.apis.spotify.expires_at < Date.now()) {
                CLI.debug(`Spotify API token expired.`);
                const refreshResponse = await SpotifyApi.refreshToken(context.apis.spotify.refresh_token);
                if (refreshResponse) {
                    context.apis.spotify = refreshResponse;
                    context.apis.spotify.expires_at = Date.now() + (context.apis.spotify.expires_in * 1000);
                } else {
                    delete context.apis.spotify;
                }
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