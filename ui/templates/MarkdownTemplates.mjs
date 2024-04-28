import {create} from "https://fjs.targoninc.com/f.js";

export class MarkdownTemplates {
    static heading(text, level = 1) {
        return create(`h${level}`)
            .classes("markdown")
            .text(text)
            .build();
    }

    static paragraph(text) {
        return create("p")
            .classes("markdown")
            .text(text)
            .build();
    }

    static link(text, href) {
        return create("a")
            .classes("markdown")
            .target("_blank")
            .text(text)
            .href(href)
            .build();
    }

    static image(src, alt) {
        return create("img")
            .classes("markdown")
            .src(src)
            .alt(alt)
            .build();
    }

    static code(text) {
        return create("code")
            .classes("markdown")
            .text(text)
            .build();
    }

    static bold(text) {
        return create("strong")
            .classes("markdown")
            .text(text)
            .build();
    }

    static italic(text) {
        return create("em")
            .classes("markdown")
            .text(text)
            .build();
    }

    static boldItalic(text) {
        return create("strong")
            .classes("markdown", "italic")
            .text(text)
            .build();
    }

    static quote(text) {
        return create("blockquote")
            .classes("markdown")
            .text(text)
            .build();
    }

    static listItem(text) {
        return create("li")
            .classes("markdown")
            .text(text)
            .build();
    }

    static numberedListItem(text, number) {
        return create("li")
            .classes("markdown")
            .text(`${number}. ${text}`)
            .build();
    }
}