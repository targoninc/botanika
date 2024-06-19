import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {CreateFileIntent} from "../files/CreateFileIntent.mjs";
import {ContextIntent} from "./ContextIntent.mjs";

export class ContextFeature extends BotanikaFeature {
    static name = "context";

    static isEnabled() {
        return true;
    }

    static getIntents() {
        return [
            ContextIntent
        ];
    }
}