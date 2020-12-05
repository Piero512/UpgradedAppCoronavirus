import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// Native plugins
import {HTTP} from '@ionic-native/http/ngx';
import {Network} from '@ionic-native/network/ngx';
import {SecureStorage} from '@ionic-native/secure-storage/ngx';
import {LocationAccuracy} from '@ionic-native/location-accuracy/ngx';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';
import {File} from '@ionic-native/file/ngx';
import {DatePipe} from '@angular/common';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {IntelSecurity} from '@ionic-native/intel-security/ngx';
import {DatePicker} from '@ionic-native/date-picker/ngx';
import {Clipboard} from '@ionic-native/clipboard/ngx';
import {LocationProvider} from './providers/location/location';
import {BackgroundGeolocation} from '@ionic-native/background-geolocation/ngx';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {ScoreProvider} from './providers/score/score';
import {APIProvider} from './providers/api/api';
import {AlertProvider} from './providers/alert/alert';
import {DatabaseProvider} from './providers/database/database';
import {ValidationsProvider} from './providers/validations/validations';
import {StorageProvider} from './providers/storage/storage';
import {NotificationsProvider} from './providers/notifications/notifications';
import {FormsProvider} from './providers/forms/forms';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    HTTP,
    Network,
    SecureStorage,
    LocationAccuracy,
    Diagnostic,
    LocalNotifications,
    File,
    DatePipe,
    Geolocation,
    IntelSecurity,
    DatePicker,
    Clipboard,
    LocationProvider,
    BackgroundGeolocation,
    SQLite,
    ScoreProvider,
    APIProvider,
    AlertProvider,
    DatabaseProvider,
    ValidationsProvider,
    StorageProvider,
    NotificationsProvider,
    FormsProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
