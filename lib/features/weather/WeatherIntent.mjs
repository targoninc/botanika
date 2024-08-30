import {WeatherApi} from "./WeatherApi.mjs";
import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {CLI} from "../../tooling/CLI.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

export class WeatherIntent extends GenericIntent {
    static name = "weather";

    static getTool() {
        return {
            tool: ToolBuilder.function('weather')
                .description('Use the weather API to get weather information.')
                .parameters(ToolParameter.object()
                    .property("city", "string", "The city to get weather information for.")
                    .property("dayOffset", "number", "The day offset from the current date to get weather information for. Can be any number between -1 and 2.")
                    .required("city", "dayOffset")
                    .parameter
                ).tool,
            toolFunction: async (text, context, parameters) => {
                return await WeatherIntent.execute(text, context, parameters.city, parameters.dayOffset);
            }
        }
    }

    static isDisabled() {
        return !process.env.OPENWEATHER_API_KEY;
    }

    static getResponseStringFromData(weatherInfo) {
        return `The weather in ${weatherInfo.city.name} ${weatherInfo.day} is ${weatherInfo.temp} degrees with ${weatherInfo.description}. The wind speed is ${weatherInfo.wind} meters per second and the cloud coverage is ${weatherInfo.clouds}%. The humidity is ${weatherInfo.humidity}%.`;
    }

    static getResponseFromData(weatherInfo, startTime) {
        return [
            {
                type: "image",
                url: `https://openweathermap.org/img/w/${weatherInfo.icon}.png`,
                timeToResponse: Date.now() - startTime
            },
            {
                type: "assistant-response",
                text: WeatherIntent.getResponseStringFromData(weatherInfo),
                timeToResponse: Date.now() - startTime
            }
        ];
    }

    static async execute(text, context, city, dayOffset) {
        const startTime = Date.now();
        if (!city) {
            CLI.debug(`Intent: Weather without city`);
            return null;
        }
        if (!dayOffset) {
            CLI.debug(`Intent: Current weather for ${city}`);
            const weatherInfo = await WeatherApi.current(city);
            weatherInfo.day = "today";
            return WeatherIntent.getResponseFromData(weatherInfo, startTime);
        }
        CLI.debug(`Intent: Weather for ${city} in ${dayOffset} days`);
        const weatherInfo = await WeatherApi.forecast(city, dayOffset);
        weatherInfo.day = WeatherIntent.getRequestedDay(context, dayOffset);
        return WeatherIntent.getResponseFromData(weatherInfo, startTime);
    }

    static getRequestedDay(context, dayOffset) {
        const today = new Date();
        const day = new Date(today.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
        return "on " + day.toLocaleDateString(context.user.language, {weekday: 'long'});
    }
}