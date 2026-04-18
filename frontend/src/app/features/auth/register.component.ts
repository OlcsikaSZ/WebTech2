import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../core/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = false;
  registerError = '';

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  submit() {
    this.registerError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.hasError('passwordMismatch')) {
        this.registerError = 'A két jelszó nem egyezik.';
      }

      return;
    }

    const { username, password } = this.form.getRawValue() as any;
    this.loading = true;

    this.auth.register(username, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.snack.open('Sikeres regisztráció. Most már be tudsz lépni.', 'OK', {
            duration: 2500,
          });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.error?.errors?.[0]?.msg ||
            'Sikertelen regisztráció. Kérlek ellenőrizd az adatokat.';

          this.registerError = msg;

          this.snack.open(this.registerError, 'OK', {
            duration: 3000,
            panelClass: ['app-snackbar-error']
          });
        }
      });
  }
}