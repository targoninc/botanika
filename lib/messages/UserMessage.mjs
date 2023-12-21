import {GenericMessage} from "./GenericMessage.mjs";

export class UserMessage extends GenericMessage {
    constructor(text) {
        super('user', text);
    }
}