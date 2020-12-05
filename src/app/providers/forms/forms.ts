import {Injectable} from '@angular/core';

import * as Constants from '../../../data/constants';
import {APIProvider} from '../api/api';
import {StorageProvider} from '../storage/storage';

import * as calculos from '../../../assets/calculos/calculo.json';
import * as initial from '../../../assets/plantilla/initial.json';
import * as followUp from '../../../assets/plantilla/follow_up.json';
import {NotificationsProvider} from '../notifications/notifications';

/*
  Generated class for the FormsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FormsProvider {

    formValidators = calculos as any;
    initialFormTemplate = initial as any;
    followUpFormTemplate = followUp as any;

    constructor(
        private api: APIProvider,
        private storage: StorageProvider,
        private notifications: NotificationsProvider
    ) {
    }

    async copyTemplatesFromSourceToStorageIfAbsent() {
        let formTemplates = await this.storage.get('formTemplates');

        if (formTemplates == null) {
            formTemplates = {};
            formTemplates.initial = this.initialFormTemplate;
            formTemplates.follow_up = this.followUpFormTemplate;

            await this.storage.set('formTemplates', formTemplates);
            await this.storage.set('formValidators', this.formValidators);
        }
    }

    async checkForFormsUpdates() {
        for (const formType of Object.keys(Constants.FORMS_DATASETS)) {
            try {
                const dataset = await this.api.getTemplatesDataset(formType);
                const templates = dataset.resources;

                if (templates.length > 0) {
                    templates.sort((tempA: any, tempB: any) => tempA.position - tempB.position);
                    const latestTemplate = templates[templates.length - 1];

                    const formTemplate = await this.api.getFormTemplate(latestTemplate.package_id, latestTemplate.id, latestTemplate.name);
                    await this.replaceTemplate(formTemplate, formType);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private async replaceTemplate(template: any, formType: string) {
        const templates = await this.storage.get('formTemplates');
        const currentTemplate = templates[formType];
        if (currentTemplate == null || currentTemplate[0].uuid !== template[0].uuid) {
            if (formType === 'follow_up') {
                template[0].notifications = currentTemplate[0].notifications;
            }
            templates[formType] = template;
            if (formType === 'initial_plus' || formType === 'follow_up_plus') {
                this.notifications.setNotificaciones(template[0]);
            }
            await this.storage.set('formTemplates', templates);
            await this.replaceForm(template[0], formType);
        }
    }

    private async replaceForm(template: any, formType: string) {
        const lastForms = await this.storage.get('lastForms');
        const formToReplace = lastForms ? lastForms[formType] : null;
        if (formToReplace != null) {
            formToReplace.template = template.uuid;
            formToReplace.form = template.data[formType];
            delete formToReplace.saved;
            await this.storage.set('lastForms', lastForms);
        }
    }
}
