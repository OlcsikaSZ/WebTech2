import { Component, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, CurrentUser, UserRole } from '../../core/auth.service';
import { OrderService, OrderDto } from '../../core/order.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, MatCardModule, MatSnackBarModule, MatButtonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private orderService = inject(OrderService);

  me: CurrentUser | null = null;
  users: CurrentUser[] = [];
  loading = true;
  usersLoading = false;
  orders: OrderDto[] = [];
  ordersLoading = false;
  selectedOrder: OrderDto | null = null;

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.loadMe();
    this.loadOrders();

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  loadMe(): void {
    this.loading = true;

    this.auth.me()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.me = user;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.snack.open('Nem sikerült betölteni a saját fiókadatokat.', 'OK', { duration: 2500 });
          this.cdr.detectChanges();
        },
      });
  }

  loadUsers(): void {
    this.usersLoading = true;

    this.auth.listUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.usersLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.usersLoading = false;
          this.snack.open('Nem sikerült betölteni a felhasználókat.', 'OK', { duration: 2500 });
          this.cdr.detectChanges();
        },
      });
  }

  loadOrders(): void {
    this.ordersLoading = true;

    this.orderService.mine()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: (orders) => {
            this.orders = orders;
            this.ordersLoading = false;
            this.cdr.detectChanges();
        },
        error: () => {
            this.ordersLoading = false;
            this.snack.open('Nem sikerült betölteni a rendeléseket.', 'OK', { duration: 2500 });
            this.cdr.detectChanges();
        },
        });
    }

    openOrder(order: OrderDto): void {
    this.selectedOrder = order;
    }

    closeOrder(): void {
    this.selectedOrder = null;
    }

  changeRole(user: CurrentUser, role: UserRole): void {
    if (user.role === role) return;

    this.auth.updateUserRole(user._id, role)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Jogosultság frissítve.', 'OK', { duration: 2000 });
          this.loadUsers();
          if (this.me?._id === user._id) this.loadMe();
        },
        error: (err) => {
          const msg = err?.error?.message || 'A jogosultság módosítása nem sikerült.';
          this.snack.open(msg, 'OK', { duration: 2500 });
          this.cdr.detectChanges();
        },
      });
  }

  deleteUser(user: CurrentUser): void {
    const ok = confirm(`Biztosan törlöd ezt a fiókot?\n\n${user.username}`);
    if (!ok) return;

    this.auth.deleteUser(user._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Felhasználó törölve.', 'OK', { duration: 2000 });
          this.loadUsers();
        },
        error: (err) => {
          const msg = err?.error?.message || 'A törlés nem sikerült.';
          this.snack.open(msg, 'OK', { duration: 2500 });
          this.cdr.detectChanges();
        },
      });
  }
}