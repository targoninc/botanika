import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {ChatIntent} from "./ChatIntent.mjs";

export class ChatFeature extends BotanikaFeature {
    static name = "chat";

    static getIntents() {
        return [
            ChatIntent
        ];
    }
}