/* tslint:disable:object-literal-key-quotes */
import {AlertController, LoadingController, Platform, ModalController} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Component} from '@angular/core';
// Native plugins
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StorageProvider} from './providers/storage/storage';
import {ScoreProvider} from './providers/score/score';
import {APIProvider} from './providers/api/api';
import {FormsProvider} from './providers/forms/forms';
import {FormPage} from './pages/form/form';
import {TabsPage} from './pages/tabs/tabs';
import {AuthPage} from './pages/auth/auth.page';
import {UserPage} from './pages/user/user.page';
import {Plugins} from '@capacitor/core';

const {App} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {

    activeNav: any;
    activePage: any;
    backButtonAlertPresent: boolean;

    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        private alertController: AlertController,
        private appCtrl: App,
        private loadingCtrl: LoadingController,
        private storage: StorageProvider,
        private scoreProvider: ScoreProvider,
        private api: APIProvider,
        private forms: FormsProvider
    ) {
        this.platform.ready().then(async () => {
            const loader = await this.loadingCtrl.create({
                message: 'Espere...',
            });
            await loader.present();

            this.platform.backButton.subscribeWithPriority(0, () => {
                this.handleBackButtonAction();
            });

            this.statusBar.styleDefault();
            this.splashScreen.hide();

            this.storage.getUser().then(user => {
                if (user !== null) {
                    this.storage.get('firstUseDate').then(firstUseDate => {
                        if (firstUseDate == null) {
                            this.appCtrl.getRootNav().setRoot(
                                FormPage,
                                {formType: 'initial'}
                            );
                        } else {
                            this.forms.checkForFormsUpdates();
                            this.scoreProvider.restartTrackingIfKilled();
                            this.api.sendPendingForms();
                            this.appCtrl.getRootNav().setRoot(TabsPage);
                        }
                    });
                } else {
                    this.appCtrl.getRootNav().setRoot(AuthPage);
                }
            });
            await loader.dismiss();
        });
    }

    handleBackButtonAction() {
        if (this.backButtonAlertPresent) {
            return;
        }

        this.activeNav = this.appCtrl.getActiveNav();

        if (this.activeNav.canGoBack()) {
            this.activeNav.pop();
        } else {
            this.activePage = this.activeNav.getActive();
            if (this.activePage.component === UserPage || this.activePage.component === AuthPage) {
                App.exitApp();
            } else if (this.activePage.component === FormPage) {
                this.storage.get('firstUseDate').then(firstUseDate => {
                    if (firstUseDate == null) {
                        App.exitApp();
                    } else {
                        this.backButtonAlertPresent = true;
                        this.confirmBackButtonAction();
                    }
                });
            } else if (this.activePage.component === ModalController) {
                this.activeNav.pop();
            } else {
                this.appCtrl.getRootNav().setRoot(TabsPage, {'tabIndex': 0});
            }
        }
    }

    confirmBackButtonAction() {
        this.alertController.create({
            header: 'Formulario incompleto',
            subHeader: '¿Deseas continuar?',
            message: 'Si continúas, el formulario no se enviará, pero se guardará para que lo edites más tarde.',
            buttons: [
                {
                    text: 'Sí',
                    handler: () => {
                        const tabIndex = this.activePage.data.formType === 'initial' ? 0 : 1;
                        this.appCtrl.getRootNav().setRoot(
                            TabsPage,
                            {'tabIndex': tabIndex},
                            {animate: true, direction: 'back'}
                        );
                    }
                },
                {
                    text: 'No',
                    role: 'cancel'
                }
            ]
        }).then((alert) => {
            alert.present();
            return alert.onDidDismiss();
        }).then(() => {
            this.backButtonAlertPresent = false;
        });
    }
}
