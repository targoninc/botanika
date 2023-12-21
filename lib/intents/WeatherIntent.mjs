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
        return indicators.some(i => text.toLowerCase().includes(i));
    }

    static requestsCurrent(text) {
        const indicators = [
            "current",
            "now",
            "this moment"
        ];
        return indicators.some(i => text.toLowerCase().includes(i));
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
        const afterFor = afterOn ?? TextParser.getWordAfter(text, "for");
        const excluded = ["in", "the", "of", "for", "on", "city"];
        const remainingText = text.split(" ").filter(w => !excluded.includes(w)).join(" ").replaceAll(/[^a-z0-9\s]/gi, "");
        const remainingWords = remainingText.split(" ");
        return afterFor ?? remainingWords[remainingWords.length - 1];
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
        const city = TextParser.getWordAfter(text, "in");
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