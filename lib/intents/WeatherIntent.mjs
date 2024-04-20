import {WeatherApi} from "../apis/WeatherApi.mjs";
import {TextParser} from "../parsers/TextParser.mjs";
import {GenericIntent} from "./GenericIntent.mjs";
import {CLI} from "../CLI.mjs";

export class WeatherIntent extends GenericIntent {
    static name = "Weather";
    static intentIndicatorsByLanguage = {
        en: [
            "weather",
            "temperature",
            "rain",
            "snow",
            "wind",
            "sun",
            "clouds",
            "forecast"
        ],
        de: [
            "wetter",
            "temperatur",
            "regen",
            "schnee",
            "wind",
            "sonne",
            "wolken",
            "vorhersage"
        ]
    }

    static isIntended(text, context) {
        for (const language in WeatherIntent.intentIndicatorsByLanguage) {
            const indicators = WeatherIntent.intentIndicatorsByLanguage[language];
            if (indicators.some(i => TextParser.includesWord(text.toLowerCase(), i))) {
                context.user.language = language;
                return true;
            }
        }
        return false;
    }

    static isDisabled() {
        return !process.env.OPENWEATHER_API_KEY;
    }

    static currentByLanguage = {
        en: [
            "current",
            "now",
            "this moment",
            "today",
            "currently",
        ],
        de: [
            "aktuell",
            "jetzt",
            "diesem moment",
            "momentan",
            "heute",
            "derzeit",
        ]
    }

    static requestsCurrent(text, language) {
        const indicators = WeatherIntent.currentByLanguage[language];
        return indicators.some(i => TextParser.includesWord(text.toLowerCase(), i));
    }

    static getDayOffsetFromToday(day, language) {
        const identifiers = {
            en: {
                yesterday: -1,
                today: 0,
                tomorrow: 1,
                overmorrow: 2
            },
            de: {
                gestern: -1,
                heute: 0,
                morgen: 1,
                übermorgen: 2
            }
        };
        return identifiers[language][day.toLowerCase()];
    }

    static getRequestedDay(text, city) {
        const afterOn = TextParser.getWordAfterWords(text, "on");
        const excluded = ["in", "the", "of", "for", "on", "city", "I", "want", "to", "know", "what", "is", "the", "weather", "like", "in", "the", "city", "called"];
        const remainingText = text.split(" ").filter(w => !excluded.includes(w)).join(" ").replaceAll(/[^a-z0-9\s]/gi, "");
        const remainingWords = remainingText.split(" ");
        return afterOn ?? remainingWords[remainingWords.length - 1];
    }

    static getCityName(text) {
        const afterIn = TextParser.getWordAfterWords(text, "in");
        return afterIn ?? TextParser.getWordAfterWords(text, "for");
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

    static async execute(text, context) {
        const startTime = Date.now();
        const city = WeatherIntent.getCityName(text);
        if (!city) {
            CLI.debug(`Intent: Weather without city`);
            return null;
        }
        const isCurrent = WeatherIntent.requestsCurrent(text, context.user.language);
        const requestedDay = WeatherIntent.getRequestedDay(text, city);
        if (isCurrent || !requestedDay || requestedDay.trim() === 'today') {
            CLI.debug(`Intent: Current weather for ${city}`);
            const weatherInfo = await WeatherApi.current(city);
            weatherInfo.day = "today";
            return WeatherIntent.getResponseFromData(weatherInfo, startTime);
        }
        const dayOffset = WeatherIntent.getDayOffsetFromToday(requestedDay, context.user.language);
        if (dayOffset === undefined) {
            CLI.debug(`Intent: Weather without day`);
            return null;
        }
        CLI.debug(`Intent: Weather for ${city} in ${dayOffset} days`);
        const weatherInfo = await WeatherApi.forecast(city, dayOffset);
        weatherInfo.day = requestedDay;
        return WeatherIntent.getResponseFromData(weatherInfo, startTime);
    }
}