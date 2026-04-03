import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { TechListComponent } from './features/tech/tech-list.component';
import { TechAddComponent } from './features/tech/tech-add.component';
import { OrderComponent } from './features/order/order.component';

import { techItemsResolver } from './core/tech-items.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    resolve: { items: techItemsResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'tech',
    component: TechListComponent,
    canActivate: [authGuard],
    resolve: { items: techItemsResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'tech/new',
    component: TechAddComponent,
    canActivate: [authGuard],
  },
  {
    path: 'order',
    component: OrderComponent,
    canActivate: [authGuard],
    resolve: { items: techItemsResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: '**',
    redirectTo: '',
  },
];