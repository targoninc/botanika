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
        if (!text || text.constructor !== String) {
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

        return true;

        const firstLinePartsCount = firstLine.split(delimiter).length;
        const badLines = lines.map(line => line.split(delimiter).length !== firstLinePartsCount);
        return !badLines;
    }

    static toJson(text, inFormat) {
        if (inFormat === "json") {
            return FormatParser.jsonFromString(text);
        } else if (inFormat === "csv") {
            return FormatParser.jsonFromCsvString(text);
        } else {
            console.log("No format detected");
            return text;
        }
    }

    static jsonFromString(text) {
        let base = JSON.parse(text);
        if (Object.keys(base).length === 1 && base[Object.keys(base)[0]].constructor === Array) {
            base = base[Object.keys(base)[0]];
            return FormatParser.jsonFromString(JSON.stringify(base));
        } else {
            return base;
        }
    }

    static jsonFromCsvString(text) {
        const lines = text.split("\n");
        const firstLine = lines[0];
        const firstLineParts = firstLine.split(",");
        return lines.slice(1).map(line => {
            const lineParts = line.split(",");
            const obj = {};
            firstLineParts.forEach((col, i) => {
                obj[col] = lineParts[i];
            });
            return obj;
        });
    }

    static toCsv(text, inFormat) {
        if (inFormat === "csv") {
            return FormatParser.csvFromString(text);
        } else if (inFormat === "json") {
            return FormatParser.csvFromJsonString(text);
        } else {
            console.log("No format detected");
            return text;
        }
    }

    static csvFromJsonString(text) {
        let json = JSON.parse(text);
        if (json.constructor === Array) {
            const keys = Object.keys(json[0]);
            const csv = [keys.join(",")];
            json.forEach(obj => {
                const line = keys.map(key => {
                    return obj[key].constructor === String ? obj[key] : JSON.stringify(obj[key]);
                }).join(",");
                csv.push(line);
            });
            return csv.join("\n");
        } else {
            if (Object.keys(json).length === 1 && json[Object.keys(json)[0]].constructor === Array) {
                json = json[Object.keys(json)[0]];
                return FormatParser.csvFromJsonString(JSON.stringify(json));
            }

            const keys = Object.keys(json);
            const csv = [keys.join(",")];
            const line = keys.map(key => {
                return json[key].constructor === String ? json[key] : JSON.stringify(json[key]);
            }).join(",");
            csv.push(line);
            return csv.join("\n");
        }
    }

    static csvFromString(text) {
        const lines = text.split("\n").filter(Boolean);
        const delimiters = [",", ";", "\t"];
        const firstLine = lines[0];

        let delimiter;
        for (let potentialDelimiter of delimiters) {
            if (firstLine.includes(potentialDelimiter)) {
                delimiter = potentialDelimiter;
                break;
            }
        }

        const firstLinePartsCount = firstLine.split(delimiter).length;
        return lines.map(line => {
            if (line.split(delimiter).length > firstLinePartsCount) {
                return line.split(delimiter).slice(0, firstLinePartsCount).join(delimiter);
            } else if (line.split(delimiter).length < firstLinePartsCount) {
                return line + ",".repeat(firstLinePartsCount - line.split(delimiter).length);
            } else {
                return line;
            }
        });
    }
}