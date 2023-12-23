import {FJS} from "@targoninc/fjs";

export class PageTemplates {
    static redirectPage(title, timeout, link) {
        let text;
        if (link === '--close') {
            text = `This window will close in ${timeout} seconds.`;
        } else {
            text = `You will be redirected to ${link} in ${timeout} seconds.`;
        }

        setTimeout(() => {
            if (link === '--close') {
                window.close();
            } else {
                window.location.href = link;
            }
        }, timeout * 1000);

        return FJS.create('div')
            .classes('full-center')
            .children(
                FJS.create('div')
                    .classes('flex-v')
                    .children(
                        FJS.create('h1')
                            .text(title)
                            .build(),
                        FJS.create('span')
                            .text(text)
                            .build()
                    ).build()
            ).build();
    }
}