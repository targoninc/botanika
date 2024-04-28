import {BotanikaFeature} from "../BotanikaFeature.mjs";

export class ResponseFeature extends BotanikaFeature {
    static name = "response";

    static isEnabled() {
        return !process.env.COMPLETION_PROVIDER ||
            (process.env.COMPLETION_PROVIDER === "groq" && !process.env.GROQ_API_KEY) ||
            (process.env.COMPLETION_PROVIDER === "openai" && !process.env.OPENAI_API_KEY);
    }
}