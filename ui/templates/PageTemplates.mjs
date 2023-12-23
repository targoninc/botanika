import {FJS} from "@targoninc/fjs";

export class PageTemplates {
    static spotifyLoginSuccess() {
        return FJS.create('div')
            .classes('flex-v', 'center')
            .children(
                FJS.create('h1')
                    .text('Spotify Login Successful')
                    .build(),
            ).build();
    }
}