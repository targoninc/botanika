import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {IntentAction} from "../actions/IntentAction.mjs";
import {ResponseHelper} from "../context/ResponseHelper.mjs";

export class SendMessageEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/send-message';
    static handler = async (req, res, context, db) => {
        const {body} = req;
        let responses = [];
        if (body.text) {
            responses.push({
                type: "user-message",
                text: body.text
            });
            responses = await IntentAction.getIntentAndRespond(body.text, context, responses);
        } else {
            responses.push({
                type: "error",
                text: "No text provided."
            });
        }
        await ResponseHelper.sendResponse(req, res, responses, context);
        await db.updateContext(req.user.id, JSON.stringify(context));
        return context;
    }
}