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

    static getResponseStringFromData(weatherInfo) {
        return `The weather in ${weatherInfo.city.name} is ${weatherInfo.temp} degrees with ${weatherInfo.description}. The wind speed is ${weatherInfo.wind} meters per second and the cloud coverage is ${weatherInfo.clouds}%.`;
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
        const otherDay = TextParser.getWordAfter(text, "on");
        if (isCurrent || !otherDay || otherDay.trim() === 'today') {
            console.log(`Intent: Current weather for ${city}`);
            const weatherInfo = await WeatherApi.current(city);
            console.log(weatherInfo);
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
        const dayOffset = WeatherIntent.getDayOffsetFromToday(otherDay);
        if (dayOffset === undefined) {
            console.log(`Intent: Weather without day`);
            return [{
                type: "assistant-response",
                text: "Sorry, I don't know for when you want the weather."
            }];
        }
        console.log(`Intent: Weather for ${city} in ${dayOffset} days`);
        const weatherInfo = await WeatherApi.forecast(city, dayOffset);
        console.log(weatherInfo);
        return [{
            type: "assistant-response",
            text: WeatherIntent.getResponseStringFromData(weatherInfo)
        }];
    }
}