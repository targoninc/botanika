import {GenericEndpoint} from "./GenericEndpoint.mjs";

export class ToggleAssistantMuteEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/toggle-assistant-mute';

    static async handler(req, res, context, db) {
        context.assistant.muted = !context.assistant.muted;
        res.send({context: context});
        await db.updateContext(req.user.id, JSON.stringify(context));
        return context;
    }
}