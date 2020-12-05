import {Injectable} from '@angular/core';
import {AlertController} from '@ionic/angular';

/*
  Generated class for the AlertProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AlertProvider {

    constructor(private alertController: AlertController) {
    }

    private showOkButtonAlert(subTitle: string) {
        const alert = this.alertController.create({
            subHeader: subTitle,
            buttons: ['OK']
        }).then((altr) => altr.present());
    }

    showConnectionErrorAlert() {
        this.showOkButtonAlert('Hubo un problema al comunicarse con el servidor. Por favor, verifique su conexión a internet o inténtelo más tarde.');
    }

    showLocationPermissionErrorAlert() {
        this.showOkButtonAlert('Hubo un problema al obtener tu ubicación. Verifica que tengas activado el GPS, inténtalo de nuevo y asegúrate otorgarnos permiso para usarlo.');
    }

    showAreaServerConnectionErrorAlert() {
        this.showOkButtonAlert('Hubo un problema al obtener el área del terreno desde el servidor. Por favor, verifica tu conexión a internet o ingrésala manualmente.');
    }

    showInvalidAppIdAlert() {
        this.showOkButtonAlert('El código de app no es válido.');
    }

    showLocalStorageError() {
        this.showOkButtonAlert('Hubo un problema al intentar acceder al almacenamiento local.');
    }

    showSentEmailSuccessAlert() {
        this.showOkButtonAlert('Se ha enviado su contraseña al correo electrónico que ha proporcionado. Por favor, revise su bandeja de entrada.');
    }

    showPairEmailIdentifierErrorAlert() {
        this.showOkButtonAlert('La cédula o correo proporcionado es inválido.');
    }

    showEmailErrorAlert() {
        this.showOkButtonAlert('El correo proporcionado es inválido.');
    }

    showLocationErrorAlert() {
        this.showOkButtonAlert('No pudimos acceder a tu ubicación.');
    }

    showLocationNoPermissionAlert() {
        this.showOkButtonAlert('Por favor, danos acceso a tu ubicación para una mejor experiencia.');
    }

    showFormSentAlert() {
        this.showOkButtonAlert('Datos actualizados.');
    }

    showFieldValueErrorAlert() {
        this.showOkButtonAlert('Campo vacío o incorrecto.');
    }

    showPositiveResultAlert() {
        this.showOkButtonAlert('Obtuviste un resultado positivo en una de tus pruebas. Desde ahora se activará un formulario de seguimiento de síntomas que deberás llenar diariamente durante 15 días. Este formulario se encuentra en la pestaña \'Encuestas\' de la aplicación.');
    }

    scoreInformation() {
        this.alertController.create({
            header: '<p align="center">Información de casa</p>',
            message: 'Toca el globo de ubicación que está debajo del círculo para registrar o actualizar la ubicación de tu casa y el tamaño del terreno. Esta información es necesaria para calcular tu nivel de exposición.',
            buttons: ['OK']
        }).then((altr) => altr.present);
    }

    infoHomeLocation() {
        this.alertController.create({
            header: '<p align="center">Registra la ubicación de tu casa</p>',
            subHeader: '<br/><li>Si el globo está de color ROJO significa que no has registrado tu domicilio.</li><br/>' +
                '<li>Para empezar a calcular tu nivel de exposición ingresa el radio de tu casa y toca <b>GUARDAR</b>.</li><br/>' +
                '<li>Puedes actualizar tu domicilio en cualquier momento.</li>',
            buttons: ['OK']
        }).then((alrt) => alrt.present());
    }

    radiusError() {
        this.alertController.create({
            header: 'El radio de tu casa es incorrecto',
            subHeader: 'Ingresa un número entero positivo.',
            buttons: ['OK']
        }).then((altr) => altr.present());
    }

    saveHomeInfoError() {
        this.alertController.create({
            header: 'Ocurrió un problema al almacenar la ubicación de tu casa',
            subHeader: 'Inténtalo de nuevo. Sin ella no prodremos brindarte información actualizada sobre tu nivel de exposición.',
            buttons: ['OK']
        }).then((altr) => altr.present());
    }

    saveHomeInfoSuccessAlert() {
        this.alertController.create({
            header: 'La ubicación de tu casa fue almacenada exitosamente',
            subHeader: 'Esto nos permitirá brindarte información actualizada sobre tu nivel de exposición.',
            buttons: ['OK']
        }).then((altr) => altr.present());
    }
}
