import { Component, computed, inject, signal } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { TechItem } from '../../core/tech.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, MatCardModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private route = inject(ActivatedRoute);

  chips = [
    { label: 'Laptopok', kind: 'laptop' },
    { label: 'Videokártyák', kind: 'gpu' },
    { label: 'Processzorok', kind: 'cpu' },
    { label: 'Tárolók', kind: 'storage' },
    { label: 'Perifériák', kind: 'peripheral' },
  ];

  items = signal<TechItem[]>(this.route.snapshot.data['items'] ?? []);

  constructor() {
    this.route.data.subscribe((data) => {
      this.items.set(data['items'] ?? []);
    });
  }

  totalQty = computed(() =>
    this.items().reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  );

  totalValue = computed(() =>
    this.items().reduce(
      (sum, item) => sum + Number(item.priceGross || 0) * Number(item.quantity || 0),
      0
    )
  );
}