import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {ResponseHelper} from "../tooling/ResponseHelper.mjs";

export class AskForChangesEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/ask-for-changes';
    static async handler(req, res, context, db) {
        const userId = req.user.id;

        const messages = await db.getPendingMessagesForUser(userId);
        console.log(`Found ${messages.length} pending messages for user ${userId}`);
        if (messages.length === 0) {
            res.status(204).send();
            return context;
        }

        const responses = messages.map(m => {
            return {
                type: m.type,
                text: m.text,
                timeToResponse: m.timeToResponse
            }
        });

        await ResponseHelper.sendResponse(req, res, responses, context);
        await db.updateContext(userId, JSON.stringify(context));
        await db.deletePendingMessages(messages.map(m => m.id));

        return context;
    }
}