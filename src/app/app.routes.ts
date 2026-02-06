import { Routes } from '@angular/router';
import { Logout } from './components/pages/logout/logout';
import { Login } from './components/pages/login/login';
import { loginGuard } from './guards/login-guard';
import { Cursos } from './components/pages/cursos/cursos';
import { Register } from './components/pages/register/register';
import { Profile } from './components/pages/profile/profile';
import { Curso } from './components/pages/curso/curso';
import { Payment } from './components/pages/payment/payment';

export const routes: Routes = [
    { path: '', component: Cursos },
    { path: 'course/:id', component: Curso },
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'profile', component: Profile, canActivate: [loginGuard] },
    { path: 'payment', component: Payment, canActivate: [loginGuard] },
    { path: 'logout', component: Logout, canActivate: [loginGuard] },
    { path: '**', redirectTo: '' },
];