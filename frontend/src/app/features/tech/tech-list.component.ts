import { Component, ChangeDetectorRef, inject, NgZone, OnInit } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { TechItem } from '../../core/tech.service';

@Component({
  selector: 'app-tech-list',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, MatCardModule, CurrencyPipe],
  templateUrl: './tech-list.component.html',
  styleUrls: ['./tech-list.component.scss'],
})
export class TechListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  loading = true;

  items: TechItem[] = [];
  filteredItems: TechItem[] = [];
  categories: string[] = [];
  selectedCategories: string[] = [];

  search = new FormControl<string>('', { nonNullable: true });
  priceMin = new FormControl<number | null>(null);
  priceMax = new FormControl<number | null>(null);
  qtyMin = new FormControl<number | null>(null);
  qtyMax = new FormControl<number | null>(null);
  dateFrom = new FormControl<string>('');
  dateTo = new FormControl<string>('');
  skuContains = new FormControl<string>('', { nonNullable: true });
  tagText = new FormControl<string>('', { nonNullable: true });
  colorText = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.zone.run(() => {
        this.loading = true;

        const items = (data['items'] ?? []) as TechItem[];
        this.items = items;
        this.categories = Array.from(
          new Set(items.map((x) => (x.category || '').trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        this.applyFilters();

        this.loading = false;
        this.cdr.detectChanges();
      });
    });

    this.search.valueChanges.subscribe(() => this.applyFilters());
    this.priceMin.valueChanges.subscribe(() => this.applyFilters());
    this.priceMax.valueChanges.subscribe(() => this.applyFilters());
    this.qtyMin.valueChanges.subscribe(() => this.applyFilters());
    this.qtyMax.valueChanges.subscribe(() => this.applyFilters());
    this.dateFrom.valueChanges.subscribe(() => this.applyFilters());
    this.dateTo.valueChanges.subscribe(() => this.applyFilters());
    this.skuContains.valueChanges.subscribe(() => this.applyFilters());
    this.tagText.valueChanges.subscribe(() => this.applyFilters());
    this.colorText.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const q = (this.search.value ?? '').toLowerCase().trim();
    const sku = (this.skuContains.value ?? '').toLowerCase().trim();
    const tags = (this.tagText.value ?? '')
      .toLowerCase()
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const color = (this.colorText.value ?? '').toLowerCase().trim();

    const minPrice = this.priceMin.value;
    const maxPrice = this.priceMax.value;
    const minQty = this.qtyMin.value;
    const maxQty = this.qtyMax.value;
    const from = this.dateFrom.value || '';
    const to = this.dateTo.value || '';

    this.filteredItems = this.items.filter((row) => {
      const searchable = [row.name, row.category, row.sku, ...(row.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (q && !searchable.includes(q)) return false;

      if (
        this.selectedCategories.length &&
        !this.selectedCategories.some(
          (cat) => cat.toLowerCase() === (row.category || '').toLowerCase()
        )
      ) {
        return false;
      }

      if (sku && !(row.sku || '').toLowerCase().includes(sku)) return false;
      if (minPrice != null && Number(row.priceGross || 0) < minPrice) return false;
      if (maxPrice != null && Number(row.priceGross || 0) > maxPrice) return false;
      if (minQty != null && Number(row.quantity || 0) < minQty) return false;
      if (maxQty != null && Number(row.quantity || 0) > maxQty) return false;
      if (from && (row.date || '') < from) return false;
      if (to && (row.date || '') > to) return false;
      if (color && !(row.color || '').toLowerCase().includes(color)) return false;

      if (tags.length) {
        const rowTags = (row.tags || []).map((t) => t.toLowerCase());
        if (!tags.some((tag) => rowTags.some((rowTag) => rowTag.includes(tag)))) {
          return false;
        }
      }

      return true;
    });

    this.cdr.detectChanges();
  }

  get totalValue(): number {
    return this.filteredItems.reduce(
      (sum, item) => sum + Number(item.priceGross || 0) * Number(item.quantity || 0),
      0
    );
  }

  get lowCount(): number {
    return this.filteredItems.filter((item) => Number(item.quantity || 0) <= 1).length;
  }

  toggleCategory(cat: string): void {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter((x) => x !== cat);
    } else {
      this.selectedCategories = [...this.selectedCategories, cat];
    }

    this.applyFilters();
  }

  isCategoryActive(cat: string): boolean {
    return this.selectedCategories.includes(cat);
  }

  clearFilters(): void {
    this.search.setValue('');
    this.selectedCategories = [];
    this.priceMin.setValue(null);
    this.priceMax.setValue(null);
    this.qtyMin.setValue(null);
    this.qtyMax.setValue(null);
    this.dateFrom.setValue('');
    this.dateTo.setValue('');
    this.skuContains.setValue('');
    this.tagText.setValue('');
    this.colorText.setValue('');
    this.applyFilters();
  }
}