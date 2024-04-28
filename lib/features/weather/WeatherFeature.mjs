import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {WeatherIntent} from "./WeatherIntent.mjs";

export class WeatherFeature extends BotanikaFeature {
    static name = 'weather';

    static isEnabled() {
        const neededEnvVars = [
            "OPENWEATHER_API_KEY"
        ];
        return neededEnvVars.every(envVar => process.env[envVar]);
    }

    static getIntents() {
        return [
            WeatherIntent
        ];
    }
}