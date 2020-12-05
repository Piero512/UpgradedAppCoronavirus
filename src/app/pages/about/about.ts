import { Component } from '@angular/core';
import { App } from '@ionic/angular';
import { StorageProvider } from '../../providers/storage/storage';
import { AuthPage } from '../auth/auth.page';
import { ScoreProvider } from '../../providers/score/score';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-page-about',
    templateUrl: 'about.html',
})
export class AboutPage {

    constructor(
        private app: App,
        private storage: StorageProvider,
        private scoreProvider: ScoreProvider) {
    }

    logout() {
        this.storage.setUser(null).then(() => {
            this.scoreProvider.backgroundGeolocation.stop();
            this.app.getRootNav().setRoot(AuthPage);
        });
    }

}
