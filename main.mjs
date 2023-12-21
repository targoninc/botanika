import express from 'express';
import {VoiceRecognitionEndpoint} from "./lib/endpoints/VoiceRecognitionEndpoint.mjs";
import {fileURLToPath} from "url";
import path from "path";
import {AddContextEndpoint} from "./lib/endpoints/AddContextEndpoint.mjs";
import {GetHistoryEndpoint} from "./lib/endpoints/GetHistoryEndpoint.mjs";
import dotenv from "dotenv";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();
const context = {
    history: [],
}
const middlewares = {
    'json': express.json(),
    'raw': express.raw(),
    'multipart': express.raw({type: 'multipart/form-data', limit: '10mb'}),
    'none': (req, res, next) => next()
}

/**
 *
 * @param app {Express}
 * @param endpoint {method, path, handler}
 */
function addEndpoint(app, endpoint) {
    const { path, handler, middleware } = endpoint;
    app.use(path, middlewares[middleware], (req, res) => {
        handler(req, res, context);
    });
}

export function addEndpoints(app, endpoints) {
    endpoints.forEach(endpoint => addEndpoint(app, endpoint));
}

const endpoints = [
    AddContextEndpoint,
    GetHistoryEndpoint
];

const app = express();
addEndpoints(app, endpoints);
app.use(VoiceRecognitionEndpoint.path, upload.single('file'), (req, res) => {
    VoiceRecognitionEndpoint.handler(req, res, context);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/", express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "ui")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, () => console.log('Listening on port 3000'));
