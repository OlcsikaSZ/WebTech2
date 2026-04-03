import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
export class TechAddComponent {
  private fb = inject(FormBuilder);
  private tech = inject(TechService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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
    imageUrl: [''],
    date: [''],
    tags: this.fb.nonNullable.control<string[]>([]),
  });

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
    this.form.controls.tags.setValue(checked ? [...current, tag] : current.filter((x) => x !== tag));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.tech.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.snack.open('Sikeres mentés', 'OK', { duration: 2000 });
        this.cdr.detectChanges();
        this.router.navigate(['/tech']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Hiba mentés közben';
        this.snack.open(msg, 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }
}
