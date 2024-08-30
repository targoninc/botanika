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
            de: "Millisekunden",
            en: "milliseconds"
        }[language];
    }

    static formatToSensible(timeInMs, language = "en") {
        const seconds = Math.floor(timeInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(weeks / 4.34524);
        const years = Math.floor(months / 12);

        function remainder(time, unit) {
            return time % unit;
        }

        if (years >= 1) {
            return `${years} ${TimeParser.yearWord(language)} ${remainder(months, 12)} ${TimeParser.monthWord(language)}`;
        } else if (months >= 1) {
            return `${months} ${TimeParser.monthWord(language)} ${remainder(weeks, 4.34524)} ${TimeParser.weekWord(language)}`;
        } else if (weeks >= 1) {
            return `${weeks} ${TimeParser.weekWord(language)} ${remainder(days, 7)} ${TimeParser.dayWord(language)}`;
        } else if (days >= 1) {
            return `${days} ${TimeParser.dayWord(language)} ${remainder(hours, 24)} ${TimeParser.hourWord(language)}`;
        } else if (hours >= 1) {
            return `${hours} ${TimeParser.hourWord(language)} ${remainder(minutes, 60)} ${TimeParser.minuteWord(language)}`;
        } else if (minutes >= 1) {
            return `${minutes} ${TimeParser.minuteWord(language)} ${remainder(seconds, 60)} ${TimeParser.secondWord(language)}`;
        } else if (seconds >= 1) {
            return `${seconds} ${TimeParser.secondWord(language)} ${remainder(timeInMs, 1000)} ${TimeParser.millisecondWord(language)}`;
        } else {
            return `${timeInMs} ${TimeParser.millisecondWord(language)}`;
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