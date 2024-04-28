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

    static toJson(text) {
        if (text.constructor === Object || text.constructor === Array) {
            text = JSON.stringify(text);
        }
        if (FormatParser.isJson(text)) {
            return JSON.parse(text);
        } else if (FormatParser.isCsv(text)) {
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
        } else {
            console.log("No format detected");
            return text;
        }
    }

    static toCsv(text) {
        if (text.constructor === Object || text.constructor === Array) {
            text = JSON.stringify(text);
        }
        if (FormatParser.isCsv(text)) {
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