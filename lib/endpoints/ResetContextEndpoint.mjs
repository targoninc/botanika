import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Context} from "../context/Context.mjs";

export class ResetContextEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/reset-context';
    static async handler(req, res, context, db) {
        // Keep API info when resetting context
        const apis = context.apis;
        context = Context.generate(req.user, req.sessionID);
        context.apis = apis;

        res.send({context: context});
        await db.updateContext(req.user.id, JSON.stringify(context));
        return context;
    }
}