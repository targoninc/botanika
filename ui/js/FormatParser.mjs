export class FormatParser {
    static getFormat(text) {
        if (FormatParser.isJson(text)) {
            return "json";
        }
        if (FormatParser.isCsv(text)) {
            return "csv";
        }
        return "text";
    }

    static isJson(text) {
        try {
            JSON.parse(text);
            return true;
        } catch (e) {
            return false;
        }
    }

    static isCsv(text) {
        if (!text) {
            return false;
        }
        if (text.startsWith("[") && text.endsWith("]")) {
            return false;
        }
        if (text.startsWith("{") && text.endsWith("}")) {
            return false;
        }

        const lines = text.split("\n").filter(Boolean);
        if (lines.length === 0) {
            return false;
        }

        const delimiters = [",", ";", "\t"];
        const firstLine = lines[0];

        let delimiter;
        for (let potentialDelimiter of delimiters) {
            if (firstLine.includes(potentialDelimiter)) {
                delimiter = potentialDelimiter;
                break;
            }
        }

        if (!delimiter) {
            return false;
        }

        const firstLinePartsCount = firstLine.split(delimiter).length;
        const badLines = lines.some(line => line.split(delimiter).length !== firstLinePartsCount);
        return !badLines;
    }

    static toJson(text) {
        if (FormatParser.isJson(text)) {
            return JSON.parse(text);
        }
        if (FormatParser.isCsv(text)) {
            const lines = text.split("\n");
            const firstLine = lines[0];
            const firstLineParts = firstLine.split(",");
            const json = lines.slice(1).map(line => {
                const lineParts = line.split(",");
                const obj = {};
                firstLineParts.forEach((col, i) => {
                    obj[col] = lineParts[i];
                });
                return obj;
            });
            return JSON.stringify(json, null, 4);
        }
        return text;
    }

    static toCsv(text) {
        if (FormatParser.isCsv(text)) {
            return text;
        }
        if (FormatParser.isJson(text)) {
            const json = JSON.parse(text);
            if (json.constructor === Array) {
                const keys = Object.keys(json[0]);
                const csv = [keys.join(",")];
                json.forEach(obj => {
                    const line = keys.map(key => {
                        return obj[key];
                    }).join(",");
                    csv.push(line);
                });
                return csv.join("\n");
            } else {
                const keys = Object.keys(json);
                const csv = [keys.join(",")];
                const line = keys.map(key => {
                    return json[key];
                }).join(",");
                csv.push(line);
                return csv.join("\n");
            }
        }
        console.log("No format detected");
        return text;
    }
}