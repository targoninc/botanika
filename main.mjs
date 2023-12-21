import express from 'express';
import {VoiceRecognitionEndpoint} from "./lib/endpoints/VoiceRecognitionEndpoint.mjs";

const context = {
    history: [],
}

/**
 *
 * @param app {express}
 * @param endpoint {method, path, handler}
 */
function addEndpoint(app, endpoint) {
    const { method, path, handler } = endpoint;
    app[method.toLowerCase()](path, (req, res) => {
        handler(req, res, context);
    });
}

export function addEndpoints(app, endpoints) {
    endpoints.forEach(endpoint => addEndpoint(app, endpoint));
}

const endpoints = [
    VoiceRecognitionEndpoint
]

const app = express();
addEndpoints(app, endpoints);

app.listen(3000, () => console.log('Listening on port 3000'));
