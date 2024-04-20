import {create, signal} from "https://fjs.targoninc.com/f.js";

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
                    .classes("button-text", "not-mobile")
                    .text(text)
                    .build()
            ).build();
    }

    static redDot(onState, scaleState) {
        const classExt = signal(onState.value ? "_" : "hidden");
        onState.subscribe((state) => {
            classExt.value = state ? "_" : "hidden";
        });
        const transform = signal(`scale(${scaleState.value})`);
        scaleState.subscribe((state) => {
            const inverseLinear = (1 - state);
            const squaredInverse = inverseLinear * inverseLinear * inverseLinear;
            const factor = 1 - squaredInverse;
            const scale = Math.max(.5, Math.min(1.5, .5 + factor));
            transform.value = `scale(${scale})`;
        });

        return create("div")
            .classes("red-dot-container")
            .children(
                create("div")
                    .styles("transform", transform)
                    .classes("red-dot", classExt)
                    .build()
            ).build();
    }
}