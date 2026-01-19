import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Boton } from '../../ui/c-boton/c-boton';

@Component({
  selector: 'login',
  imports: [FormsModule, Boton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  login: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.login || !this.password) {
      this.errorMessage = 'El usuario o la contraseña son incorrectos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.login, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/cursos']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
        console.error('Login error:', error);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
