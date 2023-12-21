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

    static execute(text, context) {
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
            return [{
                type: "assistant-response",
                text: `The weather in ${city} is ${WeatherApi.current(city)}.`
            }];
        }
        const dayOffset = WeatherIntent.getDayOffsetFromToday(otherDay);
        if (dayOffset === undefined) {
            return [{
                type: "assistant-response",
                text: "Sorry, I don't know for when you want the weather."
            }];
        }
        return [{
            type: "assistant-response",
            text: `The weather in ${city} ${otherDay} is ${WeatherApi.dayOffset(city, dayOffset)}.`
        }];
    }
}