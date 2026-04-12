import { Component, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { TechItem } from '../../core/tech.service';
import { OrderService } from '../../core/order.service';
import { TechService } from '../../core/tech.service';

type CartRow = { item: TechItem; qty: number };

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, MatCardModule, CurrencyPipe, DatePipe],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private orderService = inject(OrderService);
  private techService = inject(TechService);

  loading = true;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  items: TechItem[] = [];
  quantities: Record<string, number> = {};
  cart: CartRow[] = [];

  customerName = '';
  email = '';
  phone = '';
  address = '';
  shippingMethod = 'Személyes';
  paymentMethod = 'Utánvét';
  note = '';

  createdOrderId = '';
  createdAt = '';
  confirmedCustomerName = '';
  confirmedEmail = '';
  confirmedPhone = '';
  confirmedAddress = '';
  confirmedShippingMethod = '';
  confirmedPaymentMethod = '';
  confirmedNote = '';
  confirmedGrandTotal = 0;

  ngOnInit(): void {
    this.setItems((this.route.snapshot.data['items'] ?? []) as TechItem[]);

    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.setItems((data['items'] ?? []) as TechItem[]);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  private setItems(items: TechItem[]): void {
    this.items = items;
    this.quantities = {};

    for (const item of items) {
      this.quantities[item._id || item.sku] = 1;
    }
  }

  addToCart(item: TechItem): void {
    const key = item._id || item.sku;
    const qty = Math.max(1, Number(this.quantities[key] || 1));
    const existing = this.cart.find((x) => (x.item._id || x.item.sku) === key);

    if (qty > Number(item.quantity || 0)) {
      this.submitError = `A megadott mennyiség nagyobb, mint a készlet ennél a terméknél: ${item.name}`;
      return;
    }

    this.submitError = '';

    if (existing) {
      const nextQty = existing.qty + qty;
      if (nextQty > Number(item.quantity || 0)) {
        this.submitError = `Nincs elég készlet a következő termékből: ${item.name}`;
        return;
      }
      existing.qty = nextQty;
      this.cart = [...this.cart];
    } else {
      this.cart = [...this.cart, { item, qty }];
    }
  }

  removeFromCart(item: TechItem): void {
    const key = item._id || item.sku;
    this.cart = this.cart.filter((x) => (x.item._id || x.item.sku) !== key);
  }

  clearCart(): void {
    this.cart = [];
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, row) => sum + row.qty, 0);
  }

  increaseQty(row: CartRow): void {
    const stock = Number(row.item.quantity || 0);
    if (row.qty < stock) {
      row.qty += 1;
      this.cart = [...this.cart];
      this.submitError = '';
    } else {
      this.submitError = `Nincs több készlet ehhez: ${row.item.name}`;
    }
  }

  decreaseQty(row: CartRow): void {
    if (row.qty > 1) {
      row.qty -= 1;
      this.cart = [...this.cart];
    } else {
      this.removeFromCart(row.item);
    }
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  isPhoneValid(): boolean {
    const phone = this.phone.trim().replace(/\s+/g, '');
    return /^(\+36|06)?\d{8,9}$/.test(phone);
  }

  isRequiredInvalid(value: string): boolean {
    return !value.trim();
  }

  get shipping(): number {
    return this.shippingMethod === 'Futár' ? 1990 : 0;
  }

  get subtotal(): number {
    return this.cart.reduce((sum, row) => sum + Number(row.item.priceGross || 0) * row.qty, 0);
  }

  get grandTotal(): number {
    return this.subtotal + this.shipping;
  }

  get canSubmit(): boolean {
    return !!(
      this.cart.length > 0 &&
      this.customerName.trim() &&
      this.email.trim() &&
      this.phone.trim() &&
      this.address.trim() &&
      this.isEmailValid() &&
      this.isPhoneValid() &&
      !this.isSubmitting
    );
  }

  submitOrder(): void {
    this.submitError = '';

    if (!this.isEmailValid()) {
      this.submitError = 'Kérlek adj meg érvényes email címet.';
      return;
    }

    if (!this.isPhoneValid()) {
      this.submitError = 'Kérlek adj meg érvényes telefonszámot.';
      return;
    }

    if (this.cart.length === 0) {
      this.submitError = 'A rendelés leadásához legalább egy terméket tegyél a kosárba.';
      return;
    }

    if (!this.customerName.trim() || !this.email.trim() || !this.phone.trim() || !this.address.trim()) {
      this.submitError = 'Kérlek tölts ki minden kötelező mezőt.';
      return;
    }

    const payload = {
      customerName: this.customerName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      shippingMethod: this.shippingMethod,
      paymentMethod: this.paymentMethod,
      note: this.note.trim(),
      items: this.cart.map((row) => ({
        techItemId: row.item._id as string,
        name: row.item.name,
        qty: row.qty,
      })),
      subtotal: this.subtotal,
      shippingCost: this.shipping,
      grandTotal: this.grandTotal,
    };

    this.isSubmitting = true;

    this.orderService.create(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.createdOrderId = res?.orderNumber || res?._id || '';
        this.createdAt = res?.createdAt || new Date().toISOString();

          this.confirmedCustomerName = this.customerName.trim();
          this.confirmedEmail = this.email.trim();
          this.confirmedPhone = this.phone.trim();
          this.confirmedAddress = this.address.trim();
          this.confirmedShippingMethod = this.shippingMethod;
          this.confirmedPaymentMethod = this.paymentMethod;
          this.confirmedNote = this.note.trim();
          this.confirmedGrandTotal = this.grandTotal;

        this.cart = [];
        this.customerName = '';
        this.email = '';
        this.phone = '';
        this.address = '';
        this.shippingMethod = 'Személyes';
        this.paymentMethod = 'Utánvét';
        this.note = '';

        this.techService.list(true).subscribe({
          next: (items) => {
            this.setItems(items);
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error('RENDELÉS HIBA:', err);
        this.isSubmitting = false;
        this.submitError =
          err?.error?.message ||
          err?.error?.errors?.[0]?.msg ||
          'A rendelés mentése nem sikerült.';
      }
    });
  }

  closeSuccessModal(): void {
    this.submitSuccess = false;
  }
}