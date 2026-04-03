import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<TechItem[]>(`${environment.apiBaseUrl}/tech`);
  }

  create(item: TechItem) {
    return this.http.post<TechItem>(`${environment.apiBaseUrl}/tech`, item);
  }
}
