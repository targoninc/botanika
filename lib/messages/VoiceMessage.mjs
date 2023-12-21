import {GenericMessage} from "./GenericMessage.mjs";

export class VoiceMessage extends GenericMessage {
    constructor(text) {
        super('voice', text);
    }
}