import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AuthPage} from './auth.page';

const routes = [
    {
        path: '',
        component: AuthPage
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule],
})
export class AuthRoutingModule{}
