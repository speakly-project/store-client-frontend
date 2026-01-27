import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, of, switchMap, timeout } from 'rxjs';
import { UserInterface } from '../../../models/UserInterface';
import { AuthClient } from '../../../services/auth-client';
import { AuthService } from '../../../services/auth-service';
import { CoursesHttpClient } from '../../../services/courses-http-client';
import { Boton } from '../../ui/c-boton/c-boton';

@Component({
  selector: 'p-profile',
  imports: [CommonModule, ReactiveFormsModule, Boton],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  form!: FormGroup;
  passwordForm!: FormGroup;

  showOldPassword = false;
  showNewPassword = false;
  showRepeatNewPassword = false;

  loading = false;
  saving = false;
  loadError: string | null = null;
  saveError: string | null = null;
  saveSuccess = false;

  changingPassword = false;
  changePasswordError: string | null = null;
  changePasswordSuccess = false;

  uploadingPhoto = false;
  photoUploadError: string | null = null;
  photoUploadSuccess = false;
  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;

  isPhotoModalOpen = false;
  modalPhotoUrl: string | null = null;
  private previousBodyOverflow: string | null = null;

  private currentUser: UserInterface | null = null;

  togglePasswordVisibility(which: 'old' | 'new' | 'repeat'): void {
    if (which === 'old') {
      this.showOldPassword = !this.showOldPassword;
      return;
    }
    if (which === 'new') {
      this.showNewPassword = !this.showNewPassword;
      return;
    }
    this.showRepeatNewPassword = !this.showRepeatNewPassword;
  }

  constructor(
    private fb: FormBuilder,
    private authClient: AuthClient,
    private authService: AuthService,
    private coursesHttpClient: CoursesHttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        profilePictureUrl: ['']
      });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required]],
        repeatNewPassword: ['', [Validators.required]],
      },
      {
        validators: [this.validateNewPasswordIsNotOld(), this.validateNewPasswordsMatch()],
      }
    );

    this.loadProfile();
  }

  validateNewPasswordIsNotOld() {
    return (group: AbstractControl) => {
      const oldPassword = group.get('oldPassword')?.value;
      const newPassword = group.get('newPassword')?.value;
      if (oldPassword && newPassword && oldPassword === newPassword) {
        group.get('newPassword')?.setErrors({ sameAsOld: true });
      } else {
        const errors = group.get('newPassword')?.errors;
        if (errors) {
          delete errors['sameAsOld'];
          if (Object.keys(errors).length === 0) {
            group.get('newPassword')?.setErrors(null);
          }
        }
      }
      return null;
    };
  }

  validateNewPasswordsMatch() {
    return (group: AbstractControl) => {
      const newPassword = group.get('newPassword')?.value;
      const repeatNewPassword = group.get('repeatNewPassword')?.value;
      if (newPassword && repeatNewPassword && newPassword !== repeatNewPassword) {
        group.get('repeatNewPassword')?.setErrors({ mismatch: true });
      } else {
        const errors = group.get('repeatNewPassword')?.errors;
        if (errors) {
          delete errors['mismatch'];
          if (Object.keys(errors).length === 0) {
            group.get('repeatNewPassword')?.setErrors(null);
          }
        }
      }
      return null;
    };
  }

  dismissChangePasswordError(): void {
    this.changePasswordError = null;
  }

  dismissChangePasswordSuccess(): void {
    this.changePasswordSuccess = false;
  }

  onChangePassword(): void {
    this.changePasswordSuccess = false;
    this.changePasswordError = null;
    this.clearPasswordFieldErrors();

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const oldPassword = String(this.passwordForm.get('oldPassword')?.value ?? '').trim();
    const newPassword = String(this.passwordForm.get('newPassword')?.value ?? '').trim();

    this.changingPassword = true;

    this.coursesHttpClient
      .updateUserPassword(oldPassword, newPassword)
      .pipe(
        finalize(() => {
          this.changingPassword = false;
        }),
        catchError((error: unknown) => {
          this.handleChangePasswordError(error);
          return EMPTY;
        })
      )
      .subscribe(() => {

        this.changePasswordSuccess = true;

        this.passwordForm.reset(
          {
            oldPassword: '',
            newPassword: '',
            repeatNewPassword: '',
          },
          { emitEvent: false }
        );
      });

  }

  ngOnDestroy(): void {
    this.closePhotoModal();
    this.revokePhotoPreviewUrl();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.isPhotoModalOpen) {
      return;
    }
    this.closePhotoModal();
  }

  openPhotoModal(url: string): void {
    if (!url?.trim().length) {
      return;
    }

    this.modalPhotoUrl = url;
    this.isPhotoModalOpen = true;

    if (this.previousBodyOverflow === null) {
      this.previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = 'hidden';
  }

  closePhotoModal(): void {
    if (!this.isPhotoModalOpen) {
      return;
    }

    this.isPhotoModalOpen = false;
    this.modalPhotoUrl = null;

    if (this.previousBodyOverflow !== null) {
      document.body.style.overflow = this.previousBodyOverflow;
      this.previousBodyOverflow = null;
    }
  }

  private loadProfile(): void {
    this.loading = true;
    this.loadError = null;

    this.authClient
      .getCurrentUserFromToken()
      .pipe(
        switchMap((loginUser) => this.coursesHttpClient.getUserById(loginUser.id)),
        finalize(() => {
          this.loading = false;
        }),
        catchError(() => {
          this.loadError = 'No se pudo cargar el perfil.';
          return of(null);
        })
      )
      .subscribe((user) => {
        if (!user) {
          return;
        }
        this.currentUser = user;
        this.form.patchValue(
          {
            username: user.username ?? '',
            email: user.email ?? '',
            profilePictureUrl: user.profilePictureUrl ?? '',
          },
          { emitEvent: false }
        );
      });
  }

  onSave(): void {
    this.saveSuccess = false;
    this.saveError = null;
    this.clearServerFieldErrors();

    if (!this.currentUser) {
      this.saveError = 'No hay usuario cargado.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const username = String(this.form.get('username')?.value ?? '').trim();
    const email = String(this.form.get('email')?.value ?? '').trim();
    const profilePictureUrlRaw = String(this.form.get('profilePictureUrl')?.value ?? '').trim();

    const updated: UserInterface = {
      ...this.currentUser,
      username,
      email,
      profilePictureUrl: profilePictureUrlRaw.length ? profilePictureUrlRaw : null,
      role: 'USER',
    };

    this.saving = true;

    this.coursesHttpClient
      .updateUser(updated)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
        catchError((error: unknown) => {
          this.handleSaveError(error);
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.currentUser = res;
        this.authService.setCurrentUser(res);
        this.saveSuccess = true;
        this.router.navigate(['/profile']);
      });

  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  dismissSaveSuccess(): void {
    this.saveSuccess = false;
  }

  dismissSaveError(): void {
    this.saveError = null;
  }

  onPhotoSelected(event: Event): void {
    this.photoUploadSuccess = false;
    this.photoUploadError = null;

    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    this.selectedPhotoFile = null;

    this.revokePhotoPreviewUrl();

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.photoUploadError = 'El archivo debe ser una imagen.';
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.photoUploadError = 'La imagen es demasiado grande (máx. 5MB).';
      return;
    }

    this.photoPreviewUrl = URL.createObjectURL(file);

    this.selectedPhotoFile = file;
  }

  uploadPhoto(): void {
    this.photoUploadSuccess = false;
    this.photoUploadError = null;

    if (!this.selectedPhotoFile) {
      this.photoUploadError = 'Selecciona una imagen primero.';
      return;
    }

    this.uploadingPhoto = true;

    this.coursesHttpClient
      .uploadProfilePicture(this.selectedPhotoFile)
      .pipe(
        timeout({ first: 20000 }),
        finalize(() => {
          this.uploadingPhoto = false;
        }),
        catchError((error: unknown) => {
          this.photoUploadError = this.extractUploadErrorMessage(error);
          return of(null);
        })
      )
      .subscribe((url: string | null) => {
        if (!url) {
          return;
        }

        this.form.patchValue({ profilePictureUrl: url }, { emitEvent: false });
        this.photoUploadSuccess = true;
      });
  }

  private extractUploadErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error as any;

      const cloudinaryMessage =
        (typeof payload === 'object' && payload?.error?.message) ? String(payload.error.message) : null;

      if (cloudinaryMessage) {
        return `No se pudo subir la imagen: ${cloudinaryMessage}`;
      }

      if (typeof payload === 'string' && payload.trim().length) {
        return `No se pudo subir la imagen: ${payload}`;
      }

      return `No se pudo subir la imagen.`;
    }

    if (error instanceof Error) {
      return `No se pudo subir la imagen: ${error.message}`;
    }

    return 'No se pudo subir la imagen.';
  }

  dismissPhotoUploadSuccess(): void {
    this.photoUploadSuccess = false;
  }

  dismissPhotoUploadError(): void {
    this.photoUploadError = null;
  }

  private revokePhotoPreviewUrl(): void {
    if (!this.photoPreviewUrl) {
      return;
    }
    URL.revokeObjectURL(this.photoPreviewUrl);
    this.photoPreviewUrl = null;
  }

  private clearServerFieldErrors(): void {
    this.clearControlError('username', 'taken');
    this.clearControlError('email', 'taken');
  }

  private clearPasswordFieldErrors(): void {
    const control = this.passwordForm.get('oldPassword');
    const errors = control?.errors;
    if (!control || !errors || !errors['incorrectOld']) {
      return;
    }

    delete errors['incorrectOld'];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private handleChangePasswordError(error: unknown): void {
    const oldPasswordControl = this.passwordForm.get('oldPassword');
    const newPasswordControl = this.passwordForm.get('newPassword');

    if (!(error instanceof HttpErrorResponse)) {
      this.changePasswordError = 'No se pudo cambiar la contraseña.';
      return;
    }

    const backendMessage = this.extractBackendMessage(error);

    if (backendMessage === 'Old password is incorrect') {
      oldPasswordControl?.setErrors({ ...(oldPasswordControl.errors ?? {}), incorrectOld: true });
      oldPasswordControl?.markAsTouched();
      return;
    }

    if (backendMessage === 'New password must be different from the old password') {
      newPasswordControl?.setErrors({ ...(newPasswordControl.errors ?? {}), sameAsOld: true });
      newPasswordControl?.markAsTouched();
      return;
    }

    this.changePasswordError = backendMessage || 'No se pudo cambiar la contraseña.';
  }

  private clearControlError(controlName: 'username' | 'email', errorKey: string): void {
    const control = this.form.get(controlName);
    if (!control?.errors || !control.errors[errorKey]) {
      return;
    }

    const { [errorKey]: _removed, ...rest } = control.errors;
    control.setErrors(Object.keys(rest).length ? rest : null);
  }

  private setTakenError(controlName: 'username' | 'email', message: string): void {
    const control = this.form.get(controlName);
    if (!control) {
      return;
    }

    control.setErrors({ ...(control.errors ?? {}), taken: true });
    control.markAsTouched();
    this.saveError = message;
  }

  private handleSaveError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.saveError = 'No se pudieron guardar los cambios.';
      return;
    }

    const message = this.extractBackendMessage(error).toLowerCase();

    const raw = error.error as any;
    const fieldErrors = raw?.fieldErrors ?? raw?.errors ?? null;

    const usernameConflict =
      fieldErrors?.username ||
      message.includes('username') ||
      message.includes('already exists');

    const emailConflict =
      fieldErrors?.email ||
      message.includes('email') ||
      message.includes('already exists');

    const looksLikeDuplicate =
      error.status === 409 ||
      message.includes('already exists');

    if (looksLikeDuplicate && usernameConflict) {
      this.setTakenError('username', 'Ese nombre de usuario ya existe. Prueba con otro.');
      return;
    }

    if (looksLikeDuplicate && emailConflict) {
      this.setTakenError('email', 'Ese correo ya está en uso. Prueba con otro.');
      return;
    }

    this.saveError = this.extractBackendMessage(error) || 'No se pudieron guardar los cambios.';
  }

  private extractBackendMessage(error: HttpErrorResponse): string {
    const payload = error.error as any;

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload?.message) {
      return String(payload.message);
    }

    if (payload?.error) {
      return String(payload.error);
    }

    return error.message ?? '';
  }
}
