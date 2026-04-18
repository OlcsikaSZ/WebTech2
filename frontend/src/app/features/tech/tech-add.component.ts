import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { TechService } from '../../core/tech.service';

@Component({
  selector: 'app-tech-add',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, MatCardModule, MatSnackBarModule],
  templateUrl: './tech-add.component.html',
  styleUrls: ['./tech-add.component.scss'],
})
export class TechAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tech = inject(TechService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  itemId: string | null = null;
  editMode = false;
  loading = false;

  allCategories = ['Laptop', 'Asztali PC', 'CPU', 'GPU', 'RAM', 'Alaplap', 'Tároló', 'Periféria', 'Hálózat', 'Szoftver / Licenc', 'Egyéb'];
  allTags = ['akciós', 'új', 'népszerű', 'használt', 'felújított', 'bontatlan', 'Intel', 'AMD', 'NVIDIA', 'gamer', 'irodai', 'workstation'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', [Validators.required]],
    brand: [''],
    description: [''],
    sku: ['', [Validators.required]],
    location: [''],
    condition: ['uj'],
    status: ['Aktív'],
    reorder: [0],
    vat: [27, [Validators.required, Validators.min(0), Validators.max(100)]],
    priceNet: [0, [Validators.required, Validators.min(0)]],
    priceGross: [0, [Validators.required, Validators.min(0)]],
    quantity: [1, [Validators.required, Validators.min(0)]],
    warrantyMonths: [24],
    color: ['#2563eb'],
    date: [''],
    tags: this.fb.nonNullable.control<string[]>([]),
  });

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.itemId;

    if (this.itemId) {
      this.loading = true;
      this.tech.getById(this.itemId).subscribe({
        next: (item) => {
          this.form.patchValue({
            name: item.name,
            category: item.category,
            brand: item.brand || '',
            description: item.description || '',
            sku: item.sku,
            location: item.location || '',
            condition: item.condition || 'uj',
            status: item.status || 'Aktív',
            reorder: item.reorder ?? 0,
            vat: item.vat ?? 27,
            priceNet: item.priceNet ?? 0,
            priceGross: item.priceGross ?? 0,
            quantity: item.quantity ?? 0,
            warrantyMonths: item.warrantyMonths ?? 24,
            color: item.color || '#2563eb',
            date: item.date || '',
            tags: item.tags || [],
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.snack.open('A termék adatainak betöltése sikertelen.', 'OK', { duration: 3000 });
          this.router.navigate(['/tech']);
        }
      });
    }
  }

  recalc(from: 'net' | 'gross') {
    const vat = Number(this.form.value.vat ?? 0);
    const factor = 1 + vat / 100;

    if (from === 'net') {
      const net = Number(this.form.value.priceNet ?? 0);
      this.form.patchValue({ priceGross: Math.round(net * factor) }, { emitEvent: false });
    } else {
      const gross = Number(this.form.value.priceGross ?? 0);
      this.form.patchValue({ priceNet: Math.round(gross / factor) }, { emitEvent: false });
    }
  }

  toggleTag(tag: string, checked: boolean) {
    const current = this.form.controls.tags.value || [];
    this.form.controls.tags.setValue(
      checked ? [...current, tag] : current.filter((x) => x !== tag)
    );
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as any;

    const request = this.editMode && this.itemId
      ? this.tech.update(this.itemId, payload)
      : this.tech.create(payload);

    request.subscribe({
      next: () => {
        this.snack.open(
          this.editMode ? 'Termék sikeresen módosítva.' : 'Sikeres mentés.',
          'OK',
          { duration: 2200 }
        );
        this.router.navigate(['/tech']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Hiba mentés közben.';
        this.snack.open(msg, 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }
}