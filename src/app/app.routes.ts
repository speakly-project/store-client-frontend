import { Routes } from '@angular/router';
import { Logout } from './components/pages/logout/logout';
import { Login } from './components/pages/login/login';
import { loginGuard } from './guards/login-guard';
import { Home } from './components/pages/home/home';
import { Cursos } from './components/pages/cursos/cursos';

export const routes: Routes = [
    { path: '', component: Cursos },
    { path: 'login', component: Login},
    { path: 'logout', component: Logout },
    { path: '**', redirectTo: '' },
];