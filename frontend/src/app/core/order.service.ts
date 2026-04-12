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

export interface OrderItem {
  techItemId: string;
  name: string;
  sku: string;
  qty: number;
  unitPriceGross: number;
  lineTotalGross: number;
}

export interface OrderDto {
  _id: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  shippingMethod: string;
  paymentMethod: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  create(payload: CreateOrderPayload) {
    return this.http.post<OrderDto>(`${environment.apiBaseUrl}/orders`, payload);
  }

  mine() {
    return this.http.get<OrderDto[]>(`${environment.apiBaseUrl}/orders/mine`);
  }

  getById(id: string) {
    return this.http.get<OrderDto>(`${environment.apiBaseUrl}/orders/${id}`);
  }

  dashboardStats() {
    return this.http.get<{
      totalOrders: number;
      totalOrderValue: number;
      lowStockCount: number;
    }>(`${environment.apiBaseUrl}/orders/stats/dashboard`);
  }
}