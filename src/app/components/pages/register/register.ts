import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap, timer } from 'rxjs';
import { UserInterface } from '../../../models/UserInterface';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { Boton } from '../../ui/c-boton/c-boton';

@Component({
  selector: 'p-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Boton],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  formulario!: FormGroup;
  submitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  constructor(
    private fb: FormBuilder,
    private coursesHttpClient: CoursesHttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formulario = this.fb.group(
      {
        username: this.fb.control('', {
          validators: [Validators.required, Validators.minLength(3)],
          asyncValidators: [this.uniqueFieldValidator('username')],
          updateOn: 'blur',
        }),
        email: this.fb.control('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.uniqueFieldValidator('email')],
          updateOn: 'blur',
        }),
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [this.passwordsMatchValidator] }
    );
  }

  private passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private uniqueFieldValidator(field: 'username' | 'email'): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const rawValue = control.value;
      const value = String(rawValue ?? '').trim().toLowerCase();

      if (!value) {
        return of(null);
      }

      if (control.invalid && !control.errors?.['notUnique']) {
        return of(null);
      }

      return timer(250).pipe(
        switchMap(() => this.coursesHttpClient.getAllUsers()),
        map((users) => {
          const exists = (users ?? []).some((u) => {
            const candidate = String((u as any)?.[field] ?? '').trim().toLowerCase();
            return candidate === value;
          });
          return exists ? ({ notUnique: true } satisfies ValidationErrors) : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  onSubmit(): void {
    this.submitSuccess = false;
    this.submitError = null;

    this.formulario.get('username')?.updateValueAndValidity();
    this.formulario.get('email')?.updateValueAndValidity();

    if (this.formulario.pending) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const username = String(this.formulario.get('username')?.value ?? '').trim();
    const email = String(this.formulario.get('email')?.value ?? '').trim();
    const password = String(this.formulario.get('password')?.value ?? '');

    const nuevoUsuario: UserInterface = {
      id: 1,
      username,
      email,
      profilePictureUrl: null,
      password,
      createdAt: null,
      coursesTaken: [],
      role: 'USER',
    };

    this.coursesHttpClient
      .getAllUsers()
      .pipe(
        switchMap((users) => {
          const usersSafe = users ?? [];
          const usernameTaken = usersSafe.some(
            (u) => String((u as any)?.username ?? '').trim().toLowerCase() === username.toLowerCase()
          );
          const emailTaken = usersSafe.some(
            (u) => String((u as any)?.email ?? '').trim().toLowerCase() === email.toLowerCase()
          );

          if (usernameTaken || emailTaken) {
            const usernameCtrl = this.formulario.get('username');
            const emailCtrl = this.formulario.get('email');
            if (usernameTaken) {
              usernameCtrl?.setErrors({ ...(usernameCtrl.errors ?? {}), notUnique: true });
              usernameCtrl?.markAsTouched();
            }
            if (emailTaken) {
              emailCtrl?.setErrors({ ...(emailCtrl.errors ?? {}), notUnique: true });
              emailCtrl?.markAsTouched();
            }
            this.submitError = 'El username o el email ya existe.';
            return of(null);
          }

          return this.coursesHttpClient.createUser(nuevoUsuario).pipe(
            catchError(() => {
              this.submitError = 'No se pudo crear el usuario. Inténtalo de nuevo.';
              return of(null);
            })
          );
        }),
        finalize(() => {
          this.submitting = false;
        }),
        catchError(() => {
          this.submitError = 'No se pudo comprobar si existe el usuario.';
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) {
          return;
        }
        this.submitSuccess = true;
        this.formulario.reset();
        this.router.navigate(['/login']);
      });
  }

  onCancelar(): void {
    this.router.navigate(['/']);
  }
}
