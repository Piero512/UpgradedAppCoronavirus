import {Component} from '@angular/core';
import {AlertController, LoadingController} from '@ionic/angular';
import {TabsPage} from '../tabs/tabs';
import {StorageProvider} from '../../providers/storage/storage';
import {File} from '@ionic-native/file/ngx';
import {APIProvider} from '../../providers/api/api';
import {AlertProvider} from '../../providers/alert/alert';
import {ValidationsProvider} from '../../providers/validations/validations';
import {FormPage} from '../form/form';
import {ScoreProvider} from '../../providers/score/score';

import {FormsProvider} from '../../providers/forms/forms';

@Component({
    selector: 'app-page-auth',
    templateUrl: 'auth.page.html'
})

export class AuthPage {
    appPIN: string;

    constructor(
        private storage: StorageProvider,
        private file: File,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private api: APIProvider,
        private alerts: AlertProvider,
        private validations: ValidationsProvider,
        private scoreProvider: ScoreProvider,
        private forms: FormsProvider) {

        this.storage.setNotifications(null);
        this.crearDirectorio();
    }

    crearDirectorio() {
        File.checkDir(
            File.externalApplicationStorageDirectory, 'AppCoronavirus')
            .catch(() => {
                File.createDir(File.externalApplicationStorageDirectory, 'AppCoronavirus', false)
                    .catch(console.log);
            });
    }

    async attemptAuth() {
        const loader = await this.loadingCtrl.create({
            message: 'Espere...',
        });
        await loader.present();

        try {
            const appIdIsValid = await this.api.validateAppCode(this.appPIN);
            if (!appIdIsValid) {
                await loader.dismiss();
                this.alerts.showInvalidAppIdAlert();
                return;
            }
        } catch {
            await loader.dismiss();
            this.alerts.showConnectionErrorAlert();
            return;
        }

        let datasetCreated: any;
        try {
            await this.api.getFormsDataset(this.appPIN);
        } catch {
            try {
                datasetCreated = await this.api.createFormsDataSet(this.appPIN);
            } catch {
                this.alerts.showConnectionErrorAlert();
                return;
            }
        } finally {
            await loader.dismiss();
        }

        try {
            await this.storeUser();
            await this.scoreProvider.checkforInestimableScores();
        } catch {
            await loader.dismiss();
            this.alerts.showLocalStorageError();
            return;
        }

        await this.scoreProvider.restartTrackingIfStopped();
        await this.forms.copyTemplatesFromSourceToStorageIfAbsent();
        await this.forms.checkForFormsUpdates();

        if (!datasetCreated) { // Already created
            // TODO: Change to navigation to this thing.
            // this.app.getRootNav().setRoot(TabsPage);
            this.storage.get('firstUseDate').then(firstUseDate => {
                if (firstUseDate == null) {
                    this.storage.set('firstUseDate', new Date()); // This may not be the real first use date
                }
            });
        } else {
            // TODO: Change to navigation to this thing.
            // this.app.getRootNav().setRoot(FormPage, {formType: 'initial'});
        }
    }

    async storeUser() {
        await this.storage.setDatasetId(this.appPIN);
        await this.storage.setUser(this.appPIN);
        await this.storage.setUserData(this.appPIN);
    }

    async passwordRecover() {
        const prompt = await this.alertCtrl.create({
            header: '<p align="center">Recuperación de contraseña</p>',
            message: 'Escriba una dirección de correo electrónico válida a la que podamos enviar su contraseña.',
            inputs: [
                {
                    name: 'id',
                    type: 'text',
                    placeholder: 'Ingresa tu cédula'
                },
                {
                    name: 'email',
                    type: 'email',
                    placeholder: 'usuario@correo.com'
                },
            ],
            buttons: [
                {
                    text: 'Cancelar'
                },
                {
                    text: 'Enviar',
                    handler: data => {
                        if (this.validations.validateEmail(data.email) && this.validations.validateIdentificationCard(data.id)) {
                            this.confirmacionEnvioCorreo(data.cedula, data.email);
                        } else {
                            this.alerts.showPairEmailIdentifierErrorAlert();
                        }
                    }
                }
            ]
        });
        await prompt.present();
    }

    async confirmacionEnvioCorreo(cedula: string, emailAddress: string) {
        const loader = await this.loadingCtrl.create({
            message: 'Espere...',
        });
        await loader.present();
        this.api.sendAppIdToEmail(cedula, emailAddress).then(async sent => {
            await loader.dismiss();
            if (sent) {
                this.alerts.showSentEmailSuccessAlert();
            } else {
                this.alerts.showPairEmailIdentifierErrorAlert();
            }
        }).catch(async () => {
            await loader.dismiss();
            this.alerts.showConnectionErrorAlert();
        });
    }

    onEnterKey(e) {
        // TODO: Maybe this is intercepting the back button?
        if (e.keyCode == 13) {
            const activeElement = document.activeElement as HTMLElement;
            activeElement && activeElement.blur && activeElement.blur();
        }
    }
}
