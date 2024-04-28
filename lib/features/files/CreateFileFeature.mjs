import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {CreateFileIntent} from "./CreateFileIntent.mjs";

export class CreateFileFeature extends BotanikaFeature {
    static name = "create-file";

    static isEnabled() {
        return true;
    }

    static getIntents() {
        return [
            CreateFileIntent
        ];
    }
}