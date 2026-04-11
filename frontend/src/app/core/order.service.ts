import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CreateOrderItemPayload {
  techItemId: string;
  name: string;
  qty: number;
}

export interface CreateOrderPayload {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  shippingMethod: string;
  paymentMethod: string;
  note: string;
  items: CreateOrderItemPayload[];
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  create(payload: CreateOrderPayload) {
    return this.http.post(`${environment.apiBaseUrl}/orders`, payload);
  }
}