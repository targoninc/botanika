import {WeatherApi} from "../apis/WeatherApi.mjs";
import {TextParser} from "../parsers/TextParser.mjs";

export class WeatherIntent {
    static isIntended(text) {
        const indicators = [
            "weather",
            "temperature",
            "rain",
            "snow",
            "wind",
            "sun",
            "clouds",
            "forecast"
        ];
        return indicators.some(i => TextParser.includesWord(text.toLowerCase(), i));
    }

    static requestsCurrent(text) {
        const indicators = [
            "current",
            "now",
            "this moment"
        ];
        return indicators.some(i => TextParser.includesWord(text.toLowerCase(), i));
    }

    static getDayOffsetFromToday(day) {
        const identifiers = {
            yesterday: -1,
            today: 0,
            tomorrow: 1,
            overmorrow: 2
        };
        return identifiers[day.toLowerCase()];
    }

    static getRequestedDay(text, city) {
        const afterOn = TextParser.getWordAfter(text, "on");
        const excluded = ["in", "the", "of", "for", "on", "city", "I", "want", "to", "know", "what", "is", "the", "weather", "like", "in", "the", "city", "called"];
        const remainingText = text.split(" ").filter(w => !excluded.includes(w)).join(" ").replaceAll(/[^a-z0-9\s]/gi, "");
        const remainingWords = remainingText.split(" ");
        return afterOn ?? remainingWords[remainingWords.length - 1];
    }

    static getCityName(text) {
        const afterIn = TextParser.getWordAfter(text, "in");
        return afterIn ?? TextParser.getWordAfter(text, "for");
    }

    static getResponseStringFromData(weatherInfo) {
        return `The weather in ${weatherInfo.city.name} ${weatherInfo.day} is ${weatherInfo.temp} degrees with ${weatherInfo.description}. The wind speed is ${weatherInfo.wind} meters per second and the cloud coverage is ${weatherInfo.clouds}%.`;
    }

    static getResponseFromData(weatherInfo) {
        return [
            {
                type: "image",
                url: `https://openweathermap.org/img/w/${weatherInfo.icon}.png`
            },
            {
                type: "assistant-response",
                text: WeatherIntent.getResponseStringFromData(weatherInfo)
            }
        ];
    }

    static async execute(text, context) {
        const city = WeatherIntent.getCityName(text);
        if (!city) {
            console.log(`Intent: Weather without city`);
            return [{
                type: "assistant-response",
                text: "I didn't understand the city name."
            }];
        }
        const isCurrent = WeatherIntent.requestsCurrent(text);
        const requestedDay = WeatherIntent.getRequestedDay(text, city);
        if (isCurrent || !requestedDay || requestedDay.trim() === 'today') {
            console.log(`Intent: Current weather for ${city}`);
            const weatherInfo = await WeatherApi.current(city);
            weatherInfo.day = "today";
            return WeatherIntent.getResponseFromData(weatherInfo);
        }
        const dayOffset = WeatherIntent.getDayOffsetFromToday(requestedDay);
        if (dayOffset === undefined) {
            console.log(`Intent: Weather without day`);
            return [{
                type: "assistant-response",
                text: "Sorry, I don't know for when you want the weather."
            }];
        }
        console.log(`Intent: Weather for ${city} in ${dayOffset} days`);
        const weatherInfo = await WeatherApi.forecast(city, dayOffset);
        weatherInfo.day = requestedDay;
        return WeatherIntent.getResponseFromData(weatherInfo);
    }
}