import {MarkdownTemplates} from "../templates/MarkdownTemplates.mjs";

export class MarkdownProcessor {
    static process(text) {
        const elements = MarkdownProcessor.parse(text);
        return MarkdownProcessor.generateHtml(elements);
    }

    static parse(text) {
        const elements = [];
        const lines = text.split('\n');
        for (let line of lines) {
            if (line.startsWith('#')) {
                const level = line.match(/#+/)[0].length;
                const text = line.replace(/#+\s*/, '');
                elements.push({
                    type: 'heading',
                    level,
                    text
                });
            } else if (line.startsWith('```')) {
                elements.push({
                    type: 'code',
                    text: line.replace(/```/, '')
                });
            } else if (line.startsWith('>')) { // For quotes
                const level = line.match(/>+/)[0].length;
                const text = line.replace(/>+\s*/, '');
                elements.push({
                    type: 'quote',
                    level,
                    text
                });
            } else if (line.startsWith('-')) { // For list item
                const level = line.match(/-+/)[0].length;
                const text = line.replace(/-+\s*/, '');
                elements.push({
                    type: 'listItem',
                    level,
                    text
                });
            } else if (line.match(/\d\. (.*?)/)) { // For numbered list item
                const number = line.match(/\d/)[0];
                const text = line.replace(/\d\. /, '');
                elements.push({
                    type: 'numberedList',
                    number,
                    text
                });
            } else {
                elements.push({
                    type: 'paragraph',
                    text: line
                });
            }

        }
        return elements;
    }

    static parseText(text) {
        const elements = [];

        // Create regular expressions for each formatting type
        const formattingTypes = [
            {name: 'boldItalic', regex: /\*\*\*(.*?)\*\*\*/g},
            {name: 'bold', regex: /\*\*(.*?)\*\*/g},
            {name: 'italic', regex: /\*(.*?)\*/g},
            {name: 'link', regex: /\[(.*?)]\((.*?)\)/g},
            {name: 'image', regex: /!\[(.*?)]\((.*?)\)/g},
        ];

        // Keep examining the text until all formatting has been extracted
        while (text.length > 0) {
            // Find the nearest formatting
            let nearest = {
                index: text.length
            };
            let nearestType;

            for (let type of formattingTypes) {
                const match = type.regex.exec(text);
                if (match && match.index < nearest.index) {
                    console.log(match, type.name);
                    nearest = match;
                    nearestType = type.name;
                }
            }

            // Add the text preceding the nearest match (if any) and the nearest match (if any) to the elements
            if (nearest.index > -1) {
                const element = {
                    type: 'text',
                    text: text.substring(0, nearest.index)
                };
                elements.push(element);
            }
            if (nearestType) {
                const element = {
                    type: nearestType,
                    text: nearest[1]
                };
                if (nearestType === 'link' || nearestType === 'image') {
                    element.href = nearest[2];
                }
                elements.push(element);
            }

            // Remove the processed portion of the text
            text = text.substring(nearest.index + (nearest[0] ? nearest[0].length : 0));
        }

        return elements;
    }

    static processText(text) {
        const elements = MarkdownProcessor.parseText(text);
        console.log(text, elements.length);
        return MarkdownProcessor.generateTextHtml(elements);
    }

    static generateHtml(elements) {
        const nodes = [];
        for (let element of elements) {
            const parsedNodes = MarkdownProcessor.processText(element.text);
            if (parsedNodes.length > 1) {
                element.textNode = MarkdownTemplates.textWrapper(parsedNodes);
            } else {
                element.textNode = MarkdownTemplates.text(element.text);
            }

            switch (element.type) {
                case 'heading':
                    nodes.push(MarkdownTemplates.heading(element.textNode, element.level));
                    break;
                case 'paragraph':
                    nodes.push(MarkdownTemplates.paragraph(element.textNode));
                    break;
                case 'code':
                    nodes.push(MarkdownTemplates.code(element.textNode));
                    break;
                case 'text':
                    nodes.push(MarkdownTemplates.text(element.text));
                    break;
                case 'quote':
                    nodes.push(MarkdownTemplates.quote(element.textNode));
                    break;
                case 'listItem':
                    nodes.push(MarkdownTemplates.listItem(element.textNode));
                    break;
                case 'numberedList':
                    nodes.push(MarkdownTemplates.numberedListItem(element.textNode, element.number));
                    break;
                default:
                    nodes.push(MarkdownTemplates.paragraph(element.textNode));
                    break;
            }
        }
        return nodes;
    }

    static generateTextHtml(elements) {
        const nodes = [];
        for (let element of elements) {
            switch (element.type) {
                case 'bold':
                    nodes.push(MarkdownTemplates.bold(element.text));
                    break;
                case 'italic':
                    nodes.push(MarkdownTemplates.italic(element.text));
                    break;
                case 'boldItalic':
                    nodes.push(MarkdownTemplates.boldItalic(element.text));
                    break;
                case 'link':
                    nodes.push(MarkdownTemplates.link(element.text, element.href));
                    break;
                case 'image':
                    nodes.push(MarkdownTemplates.image(element.src, element.alt));
                    break;
                default:
                    nodes.push(MarkdownTemplates.text(element.text));
                    break;
            }
        }
        return nodes;
    }
}
