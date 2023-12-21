import express from 'express';
import {VoiceRecognitionEndpoint} from "./lib/endpoints/VoiceRecognitionEndpoint.mjs";
import {fileURLToPath} from "url";
import path from "path";
import {AddContextEndpoint} from "./lib/endpoints/AddContextEndpoint.mjs";
import {GetHistoryEndpoint} from "./lib/endpoints/GetHistoryEndpoint.mjs";
import dotenv from "dotenv";

dotenv.config();
const context = {
    history: [],
}

/**
 *
 * @param app {Express}
 * @param endpoint {method, path, handler}
 */
function addEndpoint(app, endpoint) {
    const { path, handler } = endpoint;
    app.use(path, (req, res) => {
        handler(req, res, context);
    });
}

export function addEndpoints(app, endpoints) {
    endpoints.forEach(endpoint => addEndpoint(app, endpoint));
}

const endpoints = [
    VoiceRecognitionEndpoint,
    AddContextEndpoint,
    GetHistoryEndpoint
];

const app = express();
app.use(express.json());
addEndpoints(app, endpoints);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/", express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "ui")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, () => console.log('Listening on port 3000'));
