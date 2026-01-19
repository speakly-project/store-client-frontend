import { Routes } from '@angular/router';
import { Logout } from './components/pages/logout/logout';
import { Login } from './components/pages/login/login';

export const routes: Routes = [
    { path: 'login', component: Login},
    { path: 'logout', component: Logout}
];