import {BotanikaFeature} from "../BotanikaFeature.mjs";

export class WeatherFeature extends BotanikaFeature {
    static name = 'weather';

    static isEnabled() {
        const neededEnvVars = [
            "OPENWEATHER_API_KEY"
        ];
        return neededEnvVars.every(envVar => process.env[envVar]);
    }
}