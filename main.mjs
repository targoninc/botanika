import {fileURLToPath} from "url";
import path from "path";
import dotenv from "dotenv";
import {Features} from "./lib/Features.mjs";
import {activeEndpoints} from "./lib/endpoints/ActiveEndpoints.mjs";

dotenv.config();
const contextMap = {};

const app = Features.addExpress();
const db = await Features.addDatabase();

Features.addEndpoints(app, contextMap, db, activeEndpoints);
Features.addAuthentication(app, contextMap, db);
Features.addSpotify(app, contextMap, db);
Features.addVoiceRecognition(app, contextMap, db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
Features.addHosting(app, __dirname);
Features.addWebsocket(app, db, contextMap);