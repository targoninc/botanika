import {create} from "https://fjs.targoninc.com/f.js";

export class GenericTemplates {
    static materialIcon(icon, tag = "span") {
        return create(tag)
            .classes("material-symbols-outlined")
            .text(icon)
            .build();
    }

    static button(text, onclick, icon = null, classes = []) {
        return create("button")
            .classes(...classes)
            .onclick(onclick)
            .children(
                icon ? this.materialIcon(icon) : null,
                create("span")
                    .classes("button-text")
                    .text(text)
                    .build()
            ).build();
    }
}