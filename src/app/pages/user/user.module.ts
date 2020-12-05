import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {UserPage} from './user.page';
import {UserRoutingModule} from './user-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        UserRoutingModule
    ],
    declarations: [UserPage]
})
export class UserPageModule {
}
