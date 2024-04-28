import {MarkdownTemplates} from "./MarkdownTemplates.mjs";
import {emoji} from "./Emojis.mjs";

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
            {name: 'bold', regex: /\*\*(.*?)?\*\*/g},
            {name: 'italic', regex: /\*(.*?)\*/g},
            {name: 'link', regex: /\[(.*?)]\((.*?)\)/g},
            {name: 'image', regex: /!\[(.*?)]\((.*?)\)/g},
            {name: 'emoji', regex: /:(\w*?):/g}
        ];
        // Keep examining the text until all formatting has been extracted
        while (text.length > 0) {
            // Find the nearest formatting
            let nearest = {
                index: text.length
            };
            let nearestType;
            for (let type of formattingTypes) {
                type.regex.lastIndex = 0;     // Reset lastIndex to start search from beginning of string
                const match = type.regex.exec(text);
                if (match && match.index < nearest.index) {
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
        return MarkdownProcessor.generateTextHtml(elements);
    }

    static generateHtml(elements) {
        let nodes = [];
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
        nodes = MarkdownProcessor.postProcessBlockQuotes(nodes);
        nodes = MarkdownProcessor.postProcessListItems(nodes);
        return nodes;
    }

    static postProcessBlockQuotes(nodes) {
        // if any blockquote is followed by another blockquote,
        // merge their children into the first blockquote and remove the second blockquote
        for (let i = 0; i < nodes.length - 1; i++) {
            if (nodes[i].tagName === 'BLOCKQUOTE' && nodes[i + 1].tagName === 'BLOCKQUOTE') {
                const firstBlockQuote = nodes[i];
                const secondBlockQuote = nodes[i + 1];
                for (let child of secondBlockQuote.children) {
                    firstBlockQuote.appendChild(child);
                }
                nodes.splice(i + 1, 1);
                i--;
            }
        }
        return nodes;
    }

    static postProcessListItems(nodes) {
        let i = 0;
        while (i < nodes.length) {
            if (nodes[i].tagName === 'LI') {
                // start new list
                const ul = MarkdownTemplates.unorderedList();
                while (i < nodes.length && nodes[i].tagName === 'LI') {
                    ul.appendChild(nodes[i]);
                    nodes.splice(i, 1); // remove node from original array
                }
                nodes.splice(i, 0, ul); // insert new list back into original array
            } else {
                i++; // only increment if we didn't find a 'LI'
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
                case 'emoji':
                    nodes.push(emoji(element.text));
                    break;
                default:
                    nodes.push(MarkdownTemplates.text(element.text));
                    break;
            }
        }
        return nodes;
    }
}
