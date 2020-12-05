import { Injectable } from '@angular/core';

import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

/*
  Generated class for the LocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationProvider {

  constructor(
    private diagnostic: Diagnostic,
    private locationAccuracy: LocationAccuracy,
    private geoLocation: Geolocation) { }

  getCurrentLocation() {
    return new Promise<any>((resolve, reject) => {

        this.requestLocationAuthorization()
        .then(location => resolve(location))
        .catch(error => reject(error));

    });
  }

    private requestLocationAuthorization() {
        return  new Promise<any>((resolve, reject) => {

            this.diagnostic.requestLocationAuthorization().then(status => {

                switch(status){
                    case this.diagnostic.permissionStatus.GRANTED:
                    case this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                        this.requestGPSAccess()
                        .then(location => resolve(location))
                        .catch(error => reject(error));
                        break;
                    case this.diagnostic.permissionStatus.DENIED:
                    case this.diagnostic.permissionStatus.DENIED_ALWAYS:
                        reject('error');
                        break;
                    case this.diagnostic.permissionStatus.RESTRICTED:
                        reject('error');
                        break;
                }

            }).catch(error => {
                reject(error);
            });

        });
    }

    private requestGPSAccess() {
        return new Promise<any>((resolve, reject) => {
            this.locationAccuracy.canRequest().then(ableToRequest => {
                if(ableToRequest) {

                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                    .then(() => this.requestGPSPosition())
                    .then(location => resolve(location))
                    .catch((error) => reject(error));

                } else {
                    reject('Sin permisos para acceder a la ubicación');
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    private requestGPSPosition() {
        return new Promise<any>((resolve, reject) => {
            this.geoLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            }).then((location) => {
                resolve(location);
            }).catch(error => {
                reject(error);
            });
        });
    }

}
