/* tslint:disable:no-string-literal variable-name object-literal-key-quotes object-literal-shorthand */
import {Injectable} from '@angular/core';
import * as Constants from '../../../data/constants';
import {StorageProvider} from '../storage/storage';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Encoding} from '@ionic-native/google-maps';
import {HTTP} from '@ionic-native/http/ngx';
import {File} from '@ionic-native/file/ngx';

import * as moment from 'moment';
import {DatabaseProvider} from '../database/database';
import {FormPage} from '../../pages/form/form';


/*
  Generated class for the ScoreSenderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class APIProvider {

    constructor(
        private database: DatabaseProvider,
        private storage: StorageProvider,
        private httpClient: HttpClient,
        private http: HTTP,
        private file: File
    ) {
    }

    async sendPendingScoresToServer() {
        const pendingScores = await this.database.getPendingScores();
        const scoresByDate = {};
        pendingScores.forEach(score => {
            if (score.date in scoresByDate) {
                scoresByDate[score.date].push(score);
            } else {
                scoresByDate[score.date] = [score];
            }
        });

        for (const scoreDate of Object.keys(scoresByDate)) {
            const scores = scoresByDate[scoreDate];
            const user = await this.storage.getUser();
            await this.sendPostRequest(scores, user, scoreDate);
        }
    }

    async sendPostRequest(pendingScores: any[], phone_id: string | number, date: string) {
        const data = await this.generateUpdateScoreBody(pendingScores, phone_id, date);
        const httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json'})
        };

        this.httpClient.post(Constants.UPDATE_REGISTRY_URL, data, httpOptions)
            .toPromise().then((response: any) => {
            const updated = response.data.rows_updated;
            if (updated) {
                pendingScores.forEach(score => {
                    this.database.updateScoreStatus(score.id, 'SENT').then(result => {
                    }).catch(console.log);
                });

            } else {
                const data = this.generateInsertScoreBody(phone_id, date);
                this.httpClient.post(Constants.CREATE_REGISTRY_URL, data, httpOptions)
                    .toPromise().then(response => {
                    this.sendPostRequest(pendingScores, phone_id, date);
                }).catch(console.log);
            }
        }).catch(console.log);
    }

    getTestResultsByAppId(appId: string) {
        return new Promise<any>((resolve, reject) => {
            const data = this.generateReadTestBody(appId);
            const httpOptions = {
                headers: new HttpHeaders({'Content-Type': 'application/json'})
            };
            this.httpClient.post(Constants.READ_REGISTRY_URL, data, httpOptions)
                .toPromise().then(response => {
                resolve(response['data']);
            }).catch(error => reject(error));
        });
    }

    async postHomeInformation() {
        const user = await this.storage.getUser();
        const homeLocation = await this.storage.get('homeLocation');
        const homeArea = await this.storage.get('homeArea');
        const homeRadius = Math.sqrt(homeArea); // remove /2 cause we want diameter
        const scores = await this.database.getScores();
        // FIXME: Pass in current max distance and time to compare to previous days
        const maxDistanceAway = this.getMaxDistanceAway(scores);
        const maxTimeAway = this.getMaxTimeAway(scores);

        const data = this.generateUpdateHomeBody(
            user,
            homeLocation,
            homeRadius,
            maxDistanceAway,
            maxTimeAway
        );
        const httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json'})
        };

        this.httpClient.post(Constants.UPDATE_REGISTRY_URL, data, httpOptions)
            .toPromise().then((response: any) => {
            const updated = response.data.rows_updated;
            if (!updated) {
                const data = this.generateInsertHomeBody(
                    user,
                    homeLocation,
                    homeRadius,
                    maxDistanceAway,
                    maxTimeAway
                );
                this.httpClient.post(Constants.CREATE_REGISTRY_URL, data, httpOptions)
                    .toPromise().then((response: any) => {
                }).catch(console.log);
            }
        }).catch(console.log);
    }

    validateAppCode(app_code: string) {
        return new Promise<any>((resolve, reject) => {
            const httpOptions = {
                headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': '491c5713-dd3e-4dda-adda-e36a95d7af77'})
            };
            const data = this.generateValidationCodeBody(app_code);
            this.httpClient.post(Constants.READ_REGISTRY_URL, data, httpOptions)
                .toPromise().then((response: any) => {
                if (response.data.length > 0 && response['data'][0].en_uso === 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(error => reject(error));
        });
    }

    createFormsDataSet(datasetId: string | number) {
        return new Promise<any>((resolve, reject) => {
            const data = this.generateCreateDatasetBody(datasetId);
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': Constants.API_KEY
                })
            };

            this.httpClient.post(Constants.CREATE_DATASET_URL, data, httpOptions)
                .toPromise().then(() => {
                console.log('EXITO AL CREAR DATASET');
                resolve(1);
            }).catch(error => {
                if (error.status === 409) {
                    resolve(0); // dataset already created
                }
                reject(error);
            });
        });
    }

    getFormsDataset(datasetId: string | number) {
        return new Promise<any>((resolve, reject) => {

            const data = JSON.stringify({id: datasetId});
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': Constants.API_KEY
                })
            };

            this.httpClient.post(Constants.READ_DATASET_URL, data, httpOptions)
                .toPromise().then(response => resolve(response))
                .catch(error => {
                    console.log('[GET DATASET]', error);
                    reject(error);
                });

        });
    }

    sendAppIdToEmail(cedula: string, emailAddress: string) {
        return new Promise<any>((resolve, reject) => {
            const data = this.generateSendAppIdToEmailBody(cedula, emailAddress);
            const httpOptions = {
                headers: new HttpHeaders({'Content-Type': 'application/json'})
            };

            this.httpClient.post(Constants.SEND_EMAIL_URL, data, httpOptions)
                .toPromise().then(() => {
                resolve(1);
            }).catch(error => {
                if (error.status === 404) {
                    resolve(0);
                }
                reject(error);
            });
        });
    }

    async sendPendingForms() {
        const pendingForms = await this.storage.get('pendingForms') || [];
        const newPendingForms = [];

        for (const pendingForm of pendingForms) {
            try {
                await this.sendPendingForm(pendingForm);
            } catch {
                newPendingForms.push(pendingForm);
            }
        }
        await this.storage.set('pendingForms', newPendingForms);
    }

    private async sendPendingForm(form: any) {
        let fileName = FormPage.FORMS_FILE_NAMES[form.type];
        const formattedDate = moment().format('DD-MM-YYYY_HH-mm-ss');
        fileName = fileName + '_' + formattedDate + '.json';
        const string_form = JSON.stringify(form, null, 2);
        let carpeta: string;

        try {
            await this.file.createFile(this.file.externalApplicationStorageDirectory + 'AppCoronavirus', fileName, true);
            await this.file.writeFile(this.file.externalApplicationStorageDirectory + 'AppCoronavirus', fileName, string_form, {
                replace: true,
                append: false
            });
            carpeta = this.file.externalApplicationStorageDirectory + 'AppCoronavirus/';
            const ruta_completa = carpeta + fileName;
            await this.http.uploadFile(
                Constants.CREATE_RESOURCE_URL,
                {package_id: form.dataset, name: fileName},
                {'Content-Type': 'application/json', 'Authorization': '491c5713-dd3e-4dda-adda-e36a95d7af77'},
                ruta_completa, 'upload'
            );
        } finally {
            if (carpeta) {
                this.file.removeFile(carpeta, fileName);
            }
        }
    }

    getAreaByLocation(latitude: number, longitude: number) {
        return new Promise<any>((resolve, reject) => {
            const requestURL = `${Constants.GET_AREA_URL}/${longitude}/${latitude}`;
            this.httpClient.get(requestURL).toPromise()
                .then((response: any[]) => {
                    if (response.length > 0) {
                        resolve(response[0].area);
                    }
                    resolve();
                }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }

    async getUserInformation(appId: string) {
        const data = this.getUserInformationRequestBody(appId);
        const httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': '491c5713-dd3e-4dda-adda-e36a95d7af77'})
        };
        const response = await this.httpClient.post(
            Constants.READ_REGISTRY_URL,
            data,
            httpOptions
        ).toPromise();
        return response['data'][0];
    }

    async getTemplatesDataset(templateType: string) {
        const params = new HttpParams().set('id', Constants.FORMS_DATASETS[templateType]);
        const response = await this.httpClient.get(Constants.READ_DATASET_URL, {params}).toPromise();
        return response['result'];
    }

    async getFormTemplate(datasetId: string, templateId: string, templateName: string) {
        const templateUrl = `${Constants.API_ENDPOINT}/dataset/${datasetId}/resource/${templateId}/download/${templateName}`;
        const template = await this.httpClient.get(templateUrl).toPromise();
        return template;
    }

    getUserInformationRequestBody(appId: string) {
        const data = {
            'tabla': 'integracion_usuario',
            'condiciones': [
                {
                    'columna': 'telefono_id',
                    'comparador': '==',
                    'valor': appId
                }
            ]
        };
        return JSON.stringify(data);
    }

    generateValidationCodeBody(app_code: string) {
        const data = {
            'tabla': 'integracion_claves_app',
            'operador': 'and',
            'columnas': [
                'app_id', 'en_uso'
            ],
            'condiciones': [
                {
                    'columna': 'app_id',
                    'comparador': '==',
                    'valor': app_code
                }
            ]
        };
        return JSON.stringify(data);
    }

    async generateUpdateScoreBody(pendingScores: any[], phone_id: string | number, date: string) {
        const values = {};
        pendingScores.forEach(score => {
            values[`score_${score.hour}`] = score.score;
        });
        values['gps_point'] = await this.getEncodedRoutesByDate(date);
        const data = {
            'tabla': 'integracion_score_diario',
            'operador': 'and',
            'valores': values,
            'condiciones': [
                {
                    'columna': 'telefono_id',
                    'comparador': '==',
                    'valor': phone_id
                },
                {
                    'columna': 'dia',
                    'comparador': '==',
                    'valor': this.formatStringDate(date)
                }
            ]
        };
        return JSON.stringify(data);
    }

    async getEncodedRoutesByDate(date: string) {
        const scores = await this.database.getScoresByDate(date);
        const routes = scores.map(score => score.encoded_route);
        const points = [];
        routes.forEach(route => {
            if (route) {
                const decoded = Encoding.decodePath(route);
                points.push(...decoded);
            }
        });
        return Encoding.encodePath(points);
    }

    generateInsertScoreBody(phone_id: string | number, date: string) {
        const data = {
            'tabla': 'integracion_score_diario',
            'datos': [
                {
                    'telefono_id': phone_id,
                    'dia': this.formatStringDate(date)
                }
            ]
        };
        return JSON.stringify(data);
    }

    generateReadTestBody(appId: string) {
        const data = {
            'tabla': 'integracion_pruebas',
            'condiciones': [
                {
                    'columna': 'app_id',
                    'comparador': '==',
                    'valor': appId
                }
            ]
        };
        return JSON.stringify(data);
    }

    generateUpdateHomeBody(
        appId: string,
        homeLocation: any,
        homeRadius: any,
        maxDistanceAway: number,
        maxTimeAway: number
    ) {
        const data = {
            'tabla': 'integracion_usuario',
            'valores': {
                'lat_home': homeLocation.latitude,
                'long_home': homeLocation.longitude,
                'radio_mobilidad': maxDistanceAway,
                'ultimo_envio_datos': this.getCurrentStringDate()
            },
            'condiciones': [
                {
                    'columna': 'telefono_id',
                    'comparador': '==',
                    'valor': appId
                }
            ]
        };
        return JSON.stringify(data);
    }

    generateInsertHomeBody(
        appId: string,
        homeLocation: any,
        homeRadius: any,
        maxDistanceAway: number,
        maxTimeAway: number
    ) {
        const data = {
            'tabla': 'integracion_usuario',
            'datos': [
                {
                    'telefono_id': appId,
                    'lat_home': homeLocation.latitude,
                    'long_home': homeLocation.longitude,
                    'radio_mobilidad': maxDistanceAway,
                    'ultimo_envio_datos': this.getCurrentStringDate()
                }
            ]
        };
        return JSON.stringify(data);
    }

    generateCreateDatasetBody(datasetId: string | number) {
        const data = {
            name: datasetId.toString(),
            owner_org: Constants.OWNER_ORG
        };

        return JSON.stringify(data);
    }

    generateSendAppIdToEmailBody(cedula: string, emailAddress: string) {
        const data = {
            cedula: cedula,
            correo: emailAddress
        };

        return JSON.stringify(data);
    }

    getMaxDistanceAway(scores: any[]) {
        let maxDistanceAway = 0;
        scores.forEach(score => {
            if (score.score !== -1 && score.max_distance_home > maxDistanceAway) {
                maxDistanceAway = score.max_distance_home;
            }
        });
        return maxDistanceAway;
    }

    getMaxTimeAway(scores: any[]) {
        let maxTimeAway = 0;
        scores.forEach(score => {
            if (score.score !== -1 && score.max_time_away > maxTimeAway) {
                maxTimeAway = score.max_time_away;
            }
        });
        return maxTimeAway;
    }

    formatStringDate(date: string) {
        return moment(date, 'M/DD/YYYY').startOf('day').format('YYYY-MM-DD hh:mm:ss');
    }

    getCurrentStringDate() {
        return moment().startOf('day').format('YYYY-MM-DD hh:mm:ss');
    }
}
