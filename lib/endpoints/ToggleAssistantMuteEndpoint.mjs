import {GenericEndpoint} from "./GenericEndpoint.mjs";

export class ToggleAssistantMuteEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/toggle-assistant-mute';

    static async handler(req, res, context) {
        context.assistant.muted = !context.assistant.muted;
        res.send({context: context});
    }
}