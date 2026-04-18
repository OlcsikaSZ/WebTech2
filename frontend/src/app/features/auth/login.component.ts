import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = false;
  submitAttempted = false;
  loginError = '';

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit() {
    this.submitAttempted = true;
    this.loginError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue() as any;
    this.loading = true;

    this.auth.login(username, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.auth.setToken(res.token);
          this.snack.open('Sikeres belépés.', 'OK', { duration: 1800 });

          if (this.auth.isAdmin()) {
            this.router.navigate(['/tech']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          const rawMsg = err?.error?.message || '';
          this.loginError =
            rawMsg === 'Bad credentials'
              ? 'Hibás felhasználónév vagy jelszó.'
              : 'Sikertelen belépés. Ellenőrizd az adatokat, majd próbáld újra.';

          this.snack.open(this.loginError, 'OK', {
            duration: 3000,
            panelClass: ['app-snackbar-error']
          });
        }
      });
  }
}