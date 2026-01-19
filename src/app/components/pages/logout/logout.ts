import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { Router, RouterModule } from '@angular/router';
import { Boton } from '../../ui/c-boton/c-boton';

@Component({
  selector: 'logout',
  imports: [Boton, RouterModule],
  templateUrl: './logout.html',
  styleUrl: './logout.scss',
})
export class Logout {
  constructor(private authService: AuthService, private router: Router) {}

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
