import { Component, OnInit } from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { AuthPage } from '../auth/auth.page';

import { StorageProvider } from '../../providers/storage/storage';
import { APIProvider } from '../../providers/api/api';
import { ScoreProvider } from '../../providers/score/score';
import { NotificationsProvider } from '../../providers/notifications/notifications';
import { AlertProvider } from '../../providers/alert/alert';

/**
 * Generated class for the TestResultsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-test-results',
  templateUrl: 'test-results.html',
})
export class TestResultsPage implements OnInit {

    user: string;
    result: any;
    testsResultsMap: {};
    usersInfo: any[] = [];
    testFound: boolean;
    testStatuses = { 0: 'EN PROCESO', 1: 'PROCESADA' };
    testResults = { 0: 'NEGATIVO', 1: 'POSITIVO', 2: 'INCONCLUSO', 3: 'PENDIENTE' };

    constructor(
        private app: App,
        private storage: StorageProvider,
        private api: APIProvider,
        private scoreProvider: ScoreProvider,
        private alerts: AlertProvider,
        private notifications: NotificationsProvider,
        private loadingController: LoadingController
    ) { }

    ngOnInit() {
        this.testFound = true;
        this.searchTestResults();
    }

    logout() {
        this.storage.setUser(null).then(() => {
            this.scoreProvider.backgroundGeolocation.stop();
            this.app.getRootNav().setRoot(AuthPage);
        });
    }

    async searchTestResults(refresher = undefined){
        const loader = this.loadingController.create({ content: 'Espere...' });
        loader.present();
        try {
            this.user = await this.storage.getUser();
            const userInfo = await this.api.getUserInformation(this.user);
            const results = await this.api.getTestResultsByAppId(this.user);
            this.usersInfo = [];
            if(results) {
                let positive = false;
                const resultsMap = {string:[]};
                results.forEach(result => {
                    if(result.cedula in resultsMap){
                        resultsMap[result.cedula].push(result);
                    } else{
                        resultsMap[result.cedula] = [result];
                    }
                    if(!positive && result.cedula === userInfo.cedula) {
                        positive = result.resultado === 1;
                    }
                    this.usersInfo.push([result.cedula, result.referencia, result.muestra_id]);
                });
                this.sortResultsByDate(resultsMap);
                this.testsResultsMap = resultsMap;
                positive && this.startFollowUpForm();
            } else {
                this.testFound = false;
            }
        } catch(error) {
            console.log(error);
        } finally {
            refresher && refresher.complete();
            loader.dismiss();
        }
    }

    sortResultsByDate(resultsMap: any) {
        const sorter = (a: any, b: any) => (a.fecha_recoleccion > b.fecha_recoleccion) ? 1
        : (a.fecha_recoleccion === b.fecha_recoleccion) ? ((a.muestra_id > b.muestra_id) ? 1 : -1) : -1;
        for(const userId of Object.keys(resultsMap)){
            resultsMap[userId] = resultsMap[userId].sort(sorter);
        }
    }

    async startFollowUpForm() {
        const formTemplates = await this.storage.get('formTemplates');
        const followUpForm = formTemplates.follow_up[0];

        if(followUpForm.notifications == null) {
            this.notifications.setFollowUpNotifications(new Date(), 2, '10:00');
            this.alerts.showPositiveResultAlert();
        }
    }
}
