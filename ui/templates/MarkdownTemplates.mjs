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
}