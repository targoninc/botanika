import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {OpenIntent} from "./OpenIntent.mjs";

export class OpenFeature extends BotanikaFeature {
    static name = "open";

    static getIntents() {
        return [
            OpenIntent
        ];
    }
}