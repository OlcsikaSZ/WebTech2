import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { TechListComponent } from './features/tech/tech-list.component';
import { TechAddComponent } from './features/tech/tech-add.component';
import { OrderComponent } from './features/order/order.component';
import { RegisterComponent } from './features/auth/register.component';
import { AccountComponent } from './features/account/account.component';

import { techItemsResolver } from './core/tech-items.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    resolve: { items: techItemsResolver },
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: 'tech',
    component: TechListComponent,
    canActivate: [adminGuard],
    resolve: { items: techItemsResolver },
  },
  {
    path: 'tech/new',
    component: TechAddComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'tech/:id/edit',
    component: TechAddComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'order',
    component: OrderComponent,
    canActivate: [authGuard],
    resolve: { items: techItemsResolver },
  },
  {
    path: '**',
    redirectTo: '',
  },
];