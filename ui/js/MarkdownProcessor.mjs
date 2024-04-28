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
            } else if (line.startsWith('![')) {
                const src = line.match(/\((.*?)\)/)[1];
                const alt = line.match(/\[(.*?)]/)[1];
                elements.push({
                    type: 'image',
                    src,
                    alt
                });
            } else if (line.startsWith('[')) {
                const href = line.match(/\((.*?)\)/)[1];
                const text = line.match(/\[(.*?)]/)[1];
                elements.push({
                    type: 'link',
                    href,
                    text
                });
            } else if (line.startsWith('```')) {
                elements.push({
                    type: 'code',
                    text: line.replace(/```/, '')
                });
            } else if (line.match(/\*\*(.*?)\*\*/)) { // **bold** text
                const text = line.match(/\*\*(.*?)\*\*/)[1];
                elements.push({
                    type: 'bold',
                    text
                });
            } else if (line.match(/\*(.*?)\*/)) { // *italic* text
                const text = line.match(/\*(.*?)\*/)[1];
                elements.push({
                    type: 'italic',
                    text
                });
            } else if (line.match(/\*\*\*(.*?)\*\*\*/)) { // For ***bold and italic*** text
                const text = line.match(/\*\*\*(.*?)\*\*\*/)[1];
                elements.push({
                    type: 'boldItalic',
                    text
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

    static generateHtml(elements) {
        const nodes = [];
        for (let element of elements) {
            switch (element.type) {
                case 'heading':
                    nodes.push(MarkdownTemplates.heading(element.text, element.level));
                    break;
                case 'paragraph':
                    nodes.push(MarkdownTemplates.paragraph(element.text));
                    break;
                case 'link':
                    nodes.push(MarkdownTemplates.link(element.text, element.href));
                    break;
                case 'image':
                    nodes.push(MarkdownTemplates.image(element.src, element.alt));
                    break;
                case 'code':
                    nodes.push(MarkdownTemplates.code(element.text));
                    break;
                case 'bold':
                    nodes.push(MarkdownTemplates.bold(element.text));
                    break;
                case 'italic':
                    nodes.push(MarkdownTemplates.italic(element.text));
                    break;
                case 'boldItalic':
                    nodes.push(MarkdownTemplates.boldItalic(element.text));
                    break;
                case 'quote':
                    nodes.push(MarkdownTemplates.quote(element.text));
                    break;
                case 'listItem':
                    nodes.push(MarkdownTemplates.listItem(element.text));
                    break;
                case 'numberedList':
                    nodes.push(MarkdownTemplates.numberedListItem(element.text, element.number));
                    break;
                default:
                    nodes.push(MarkdownTemplates.paragraph(element.text));
                    break;
            }
        }
        return nodes;
    }
}
