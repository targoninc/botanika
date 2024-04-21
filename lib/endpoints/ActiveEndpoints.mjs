import {SendMessageEndpoint} from "./SendMessageEndpoint.mjs";
import {GetHistoryEndpoint} from "./GetHistoryEndpoint.mjs";
import {ToggleAssistantMuteEndpoint} from "./ToggleAssistantMuteEndpoint.mjs";
import {ResetContextEndpoint} from "./ResetContextEndpoint.mjs";
import {ResetHistoryEndpoint} from "./ResetHistoryEndpoint.mjs";

export const activeEndpoints = [
    SendMessageEndpoint,
    GetHistoryEndpoint,
    ToggleAssistantMuteEndpoint,
    ResetContextEndpoint,
    ResetHistoryEndpoint
];