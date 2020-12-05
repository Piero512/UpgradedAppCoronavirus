import {Injectable} from '@angular/core';

/*
  Generated class for the ValidationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ValidationsProvider {

    constructor() {
    }

    validateHomeRadius(radius: string) {
        const radiusConverted = Number(radius);
        return radiusConverted >= 2 && radiusConverted <= 30;
    }

    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    validateIdentificationCard(id: string) {
        let total = 0;
        const longitud = id.length;
        const longcheck = longitud - 1;

        if (id !== '' && longitud === 10) {
            for (let i = 0; i < longcheck; i++) {
                if (i % 2 === 0) {
                    let aux = Number(id.charAt(i)) * 2;
                    if (aux > 9) {
                        aux -= 9;
                    }
                    total += aux;
                } else {
                    total += parseInt(id.charAt(i), 10); // parseInt will concatenate instead of sum
                }
            }

            total = total % 10 ? 10 - total % 10 : 0;

            if (Number(id.charAt(longitud - 1)) === total) {
                return true;
            }
        }
        return false;
    }

}
