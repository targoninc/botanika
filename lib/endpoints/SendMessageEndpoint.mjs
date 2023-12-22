import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {IntentAction} from "../actions/IntentAction.mjs";

export class SendMessageEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/send-message';
    static handler = async (req, res, context) => {
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
        context.history.concat(responses);
        res.send({
            responses,
            context
        });
    }
}