import { Component, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { TechItem } from '../../core/tech.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, MatCardModule, CurrencyPipe],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  loading = true;

  items: TechItem[] = [];
  quantities: Record<string, number> = {};
  cart: Array<{ item: TechItem; qty: number }> = [];

  shipping = 0;

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

  addToCart(item: TechItem) {
    const key = item._id || item.sku;
    const qty = Math.max(1, Number(this.quantities[key] || 1));
    const existing = this.cart.find((x) => (x.item._id || x.item.sku) === key);

    if (existing) {
      existing.qty += qty;
    } else {
      this.cart = [...this.cart, { item, qty }];
    }
  }

  removeFromCart(item: TechItem) {
    const key = item._id || item.sku;
    this.cart = this.cart.filter((x) => (x.item._id || x.item.sku) !== key);
  }

  clearCart() {
    this.cart = [];
  }

  get subtotal(): number {
    return this.cart.reduce((sum, row) => sum + Number(row.item.priceGross || 0) * row.qty, 0);
  }

  get grandTotal(): number {
    return this.subtotal + this.shipping;
  }
}