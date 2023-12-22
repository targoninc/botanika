import {GenericEndpoint} from "./GenericEndpoint.mjs";

export class GetHistoryEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/get-history';
    static handler = (req, res, context) => {
        const { history } = context;
        res.send({
            type: "history",
            history
        });
    }
}