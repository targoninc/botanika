import {WebSocketServer} from "ws";
import {CLI} from "../tooling/CLI.mjs";
import {activeEndpoints} from "../endpoints/ActiveEndpoints.mjs";
import {AuthActions} from "../actions/AuthActions.mjs";

export class LiveWebSocket {
    constructor(app, db, contextMap) {
        this.app = app;
        this.db = db;
        this.contextMap = contextMap;
        this.wss = null;
    }

    start() {
        const wss = new WebSocketServer({ port: 3030 });
        this.wss = wss;

        wss.on('error', CLI.error);

        wss.on('listening', () => {
            CLI.success(`Websocket server listening on ${process.env.WEBSOCKET_URL || 'http://localhost:3030'}`);
        });

        wss.on('open', () => {
            CLI.success('Websocket client connected!');
        });

        wss.on('connection', (ws) => {
            ws.on('message', async (message) => {
                const data = JSON.parse(message);
                const context = this.contextMap[data.sessionID];
                const endpoint = activeEndpoints.find(e => e.path === data.path);
                if (!endpoint) {
                    CLI.error(`No endpoint found for path ${data.path}`);
                    return;
                }
                const req = { body: data.body, sessionID: data.sessionID };
                const res = {
                    send: (responses) => {
                        ws.send(JSON.stringify(responses));
                    }
                };
                endpoint.handler(req, res, context, this.db).then((context) => {
                    this.contextMap[data.sessionID] = context;
                });
            });
        });

        this.app.on('upgrade', AuthActions.checkAuthenticated, LiveWebSocket.onUpgrade);
    }

    async authenticate(request, next) {
        const sessionID = request.headers['sec-websocket-protocol'];
        if (!sessionID) {
            next(new Error('No session ID provided'));
            return;
        }

        const context = await this.db.getContext(sessionID);
        if (!context) {
            next(new Error('No context found for session ID'));
            return;
        }

        next(null, context);
    }

    onUpgrade(request, socket, head) {
        socket.on('error', CLI.error);

        this.authenticate(request, function next(err, client) {
            if (err || !client) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            socket.removeListener('error', CLI.error);

            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request, client);
            });
        });
    }
}