import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController} from '@ionic/angular';
import { ScoreProvider } from '../../providers/score/score';
import { StorageProvider } from '../../providers/storage/storage';
import { LocationProvider } from '../../providers/location/location';
import { APIProvider } from '../../providers/api/api';
import { AlertProvider } from '../../providers/alert/alert';

/**
 * Generated class for the HomeInformationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'app-home-information',
    templateUrl: 'home-information.html'
})
export class HomeInformationComponent implements OnInit {

    latitude: number;
    longitude: number;
    area: number;
    homeWifiNetworks: number;
    censusArea = 20000;

    constructor(
        private modalController: ModalController,
        private loadingController: LoadingController,
        private scoreProvider: ScoreProvider,
        private storage: StorageProvider,
        private location: LocationProvider,
        private api: APIProvider,
        private alerts: AlertProvider) { }

    ngOnInit() {
        this.storage.get('homeLocation').then(homeLocation => {
            if (homeLocation) {
                this.latitude = homeLocation.latitude;
                this.longitude = homeLocation.longitude;
            }
            return this.storage.get('homeArea');
        }).then(homeArea => {
            this.area = homeArea;
        });
    }

    async calculate() {
        const loader = await this.loadingController.create({
            message: 'Obteniendo ubicación...',
        });
        await loader.present();

        let location: any;
        try {
            location = await this.location.getCurrentLocation();
        } catch {
            await loader.dismiss();
            this.alerts.showLocationPermissionErrorAlert();
            return;
        }
        this.latitude = location.coords.latitude;
        this.longitude = location.coords.longitude;

        this.homeWifiNetworks = await this.scoreProvider.startScan();

        try {
            const homeArea = await this.api.getAreaByLocation(this.latitude, this.longitude);
            this.area = Math.round(homeArea);
            await loader.dismiss();
        } catch {
            await loader.dismiss();
            this.alerts.showAreaServerConnectionErrorAlert();
        }
    }

    async save() {
        if (!this.latitude || !this.longitude || !this.area) {
            this.alerts.showFieldValueErrorAlert();
            return;
        }
        const loader = await this.loadingController.create({
            message: 'Guardando...',
        });
        await loader.present();
        await this.storage.set('censusArea', this.censusArea);
        await this.storage.set('homeWifiNetworks', this.homeWifiNetworks);
        await this.storage.set('homeLocation', {
            latitude: Number(this.latitude),
            longitude: Number(this.longitude)
        });
        await this.storage.set('homeArea', this.area);

        this.api.postHomeInformation();
        this.scoreProvider.startOrReconfigureTracking();

        await loader.dismiss();
        await this.modalController.dismiss();
    }

    cancel() {
        this.modalController.dismiss();
    }

    onEnterKey(e: any) {
        if (e.keyCode == 13) {
            const activeElement = document.activeElement as HTMLElement;
            activeElement && activeElement.blur && activeElement.blur();
        }
    }
}
