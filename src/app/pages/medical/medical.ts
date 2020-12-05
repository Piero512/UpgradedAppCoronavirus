import { Component } from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { AuthPage } from '../auth/auth.page';
import { StorageProvider } from '../../providers/storage/storage';
import { FormPage } from '../form/form';
import { ScoreProvider } from '../../providers/score/score';

import * as moment from 'moment';
import { FormsProvider } from '../../providers/forms/forms';

/**
 * Generated class for the MedicalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-medical',
  templateUrl: 'medical.html',
})
export class MedicalPage {

    forms = [];

    constructor(
        private app: App,
        private storage: StorageProvider,
        private scoreProvider: ScoreProvider,
        private formsProvider: FormsProvider,
        private loadingController: LoadingController
    ) { }

    async ionViewWillEnter() {
        this.forms = [];
        const loader = this.loadingController.create({ content: 'Espere...' });
        loader.present();
        try {
            await this.formsProvider.checkForFormsUpdates();
        } finally {
            const templates = await this.storage.get('formTemplates');
            for(const type of Object.keys(templates)) {
                const template = templates[type][0];
                this.checkForActiveForms(template, type);
            }
            loader.dismiss();
        }
    }

    checkForActiveForms(template: any, formType: string) {
        if(template.notifications != null) {
            for(const notification of template.notifications) {
                const startDate = notification.children[0].date;
                const endDate = notification.children[1].date;
                const currentDate = moment().format('YYYY-MM-DD');
                if(currentDate >= startDate && currentDate <= endDate) {
                    this.forms.push({ type: formType, title: template.name });
                }
            }
        }
    }

    goToForm(type: string) {
        this.app.getRootNav().setRoot(FormPage, { 'formType': type });
    }

    logout() {
        this.storage.setUser(null).then(() => {
            this.scoreProvider.backgroundGeolocation.stop();
            this.app.getRootNav().setRoot(AuthPage);
        });
    }
}
