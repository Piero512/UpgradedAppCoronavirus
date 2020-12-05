import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { HomeInformationComponent } from './home-information/home-information';

@NgModule({
	declarations: [
        HomeInformationComponent
    ],
	imports: [IonicModule],
	exports: [
        HomeInformationComponent
    ],
    entryComponents: [
        HomeInformationComponent
    ]
})
export class ComponentsModule {}
