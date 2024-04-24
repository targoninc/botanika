import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Context} from "../context/Context.mjs";

export class ResetHistoryEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/reset-history';
    static async handler(req, res, context, db) {
        context.history = [];
        res.send({context: context});
        await db.updateContext(req.user.id, JSON.stringify(context));
        return context;
    }
}