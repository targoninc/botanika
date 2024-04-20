import {FjsObservable, signal} from "https://fjs.targoninc.com/f.js";

export class TimeParser {
    static yearWord(language) {
        return {
            de: "Jahre",
            en: "years"
        }[language];
    }

    static monthWord(language) {
        return {
            de: "Monate",
            en: "months"
        }[language];
    }

    static weekWord(language) {
        return {
            de: "Wochen",
            en: "weeks"
        }[language];
    }

    static dayWord(language) {
        return {
            de: "Tage",
            en: "days"
        }[language];
    }

    static hourWord(language) {
        return {
            de: "Stunden",
            en: "hours"
        }[language];
    }

    static minuteWord(language) {
        return {
            de: "Minuten",
            en: "minutes"
        }[language];
    }

    static secondWord(language) {
        return {
            de: "Sekunden",
            en: "seconds"
        }[language];
    }

    static millisecondWord(language) {
        return {
            de: "Millisekunde",
            en: "millisecond"
        }[language];
    }

    static formatToSensible(timeInMs, language = "en") {
        const seconds = timeInMs / 1000;
        const minutes = seconds / 60;
        const hours = minutes / 60;
        const days = hours / 24;
        const weeks = days / 7;
        const months = weeks / 4.34524;
        const years = months / 12;
        if (years >= 1) {
            return `${years.toFixed(2)} ${TimeParser.yearWord(language)}`;
        } else if (months >= 1) {
            return `${months.toFixed(2)} ${TimeParser.monthWord(language)}`;
        } else if (weeks >= 1) {
            return `${weeks.toFixed(2)} ${TimeParser.weekWord(language)}`;
        } else if (days >= 1) {
            return `${days.toFixed(2)} ${TimeParser.dayWord(language)}`;
        } else if (hours >= 1) {
            return `${hours.toFixed(2)} ${TimeParser.hourWord(language)}`;
        } else if (minutes >= 1) {
            return `${minutes.toFixed(2)} ${TimeParser.minuteWord(language)}`;
        } else if (seconds >= 1) {
            return `${seconds.toFixed(2)} ${TimeParser.secondWord(language)}`;
        } else {
            return `${timeInMs.toFixed(2)} ${TimeParser.millisecondWord(language)}`;
        }
    }

    static format(time) {
        if (time.constructor === FjsObservable) {
            const formatted = signal(TimeParser.formatToSensible(time.value));
            time.subscribe((newValue) => {
                formatted.value = TimeParser.formatToSensible(newValue);
            });
            return formatted;
        } else {
            return TimeParser.formatToSensible(time);
        }
    }
}