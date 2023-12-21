import {WeatherApi} from "../apis/WeatherApi.mjs";

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
        const city = text.split("in")[1].trim();
        if (!city) {
            return [{
                type: "assistant-response",
                text: "I didn't understand the city name."
            }];
        }
        const isCurrent = WeatherIntent.requestsCurrent(text);
        const otherDay = text.split("on")[1];
        if (isCurrent || !otherDay || otherDay.trim() === 'today') {
            const weatherInfo = await WeatherApi.current(city);
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
            return [{
                type: "assistant-response",
                text: "Sorry, I don't know for when you want the weather."
            }];
        }
        const weatherInfo = await WeatherApi.forecast(city, dayOffset);
        return [{
            type: "assistant-response",
            text: WeatherIntent.getResponseStringFromData(weatherInfo)
        }];
    }
}