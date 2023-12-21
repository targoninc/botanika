import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {UserMessage} from "../messages/UserMessage.mjs";

export class AddContextEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/add-context';
    static handler = (req, res, context) => {
        const { body } = req;
        if (body.text) {
            context.history.push(new UserMessage(body.text));
            res.send('OK');
        }
        res.send('No text yet');
    }
}