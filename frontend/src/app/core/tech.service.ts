import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TechItem {
  _id?: string;
  name: string;
  category: string;
  sku: string;
  priceGross: number;
  priceNet: number;
  vat: number;
  quantity: number;
  color?: string;
  imageUrl?: string;
  tags?: string[];
  date?: string;
  brand?: string;
  description?: string;
  location?: string;
  condition?: string;
  status?: string;
  reorder?: number;
  warrantyMonths?: number;
}

@Injectable({ providedIn: 'root' })
export class TechService {
  private itemsCache$?: Observable<TechItem[]>;

  constructor(private http: HttpClient) {}

  list(forceRefresh = false): Observable<TechItem[]> {
    if (!this.itemsCache$ || forceRefresh) {
      this.itemsCache$ = this.http
        .get<TechItem[]>(`${environment.apiBaseUrl}/tech`)
        .pipe(shareReplay(1));
    }

    return this.itemsCache$;
  }

  clearCache(): void {
    this.itemsCache$ = undefined;
  }

  create(item: TechItem) {
    return this.http
      .post<TechItem>(`${environment.apiBaseUrl}/tech`, item)
      .pipe(
        tap(() => this.clearCache())
      );
  }
}