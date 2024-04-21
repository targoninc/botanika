import {create, FjsObservable, ifjs, signal} from "https://fjs.targoninc.com/f.js";

export class GenericTemplates {
    static icon(icon, tag = "span") {
        if ((icon.constructor === String && icon.includes(".")) || (icon.constructor === FjsObservable && icon.value.includes("."))) {
            return create("img")
                .classes("icon")
                .src(icon)
                .build();
        }

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
                icon ? this.icon(icon) : null,
                create("span")
                    .classes("button-text", "not-mobile")
                    .text(text)
                    .build()
            ).build();
    }

    static buttonWithSpinner(text, onClick = () => {
    }, icon = null, loadingState = signal(false), classes = []) {
        return create("button")
            .onclick(onClick)
            .classes(...classes)
            .children(
                icon ? ifjs(loadingState, GenericTemplates.icon(icon), true) : null,
                ifjs(loadingState, create("span")
                    .text(text)
                    .build(), true),
                ifjs(loadingState, GenericTemplates.spinner()),
                ifjs(loadingState, create("span")
                    .text("Loading...")
                    .build()),
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

    static spinner(circleCount = 4, delay = 0.2) {
        return create("div")
            .classes("spinner")
            .children(
                ...Array.from({length: circleCount}, (_, i) => {
                    return create("div")
                        .classes("spinner-circle")
                        .styles("animation-delay", `-${i * delay}s`)
                        .build();
                })
            ).build();
    }

    static toast(message, type = "info", timeout = 5) {
        const toast = create("div")
            .classes("toast", type)
            .text(message)
            .build();

        setTimeout(() => {
            toast.remove();
        }, timeout * 1000);

        return toast;
    }
}