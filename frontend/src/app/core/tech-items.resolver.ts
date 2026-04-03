import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TechService, TechItem } from './tech.service';

export const techItemsResolver: ResolveFn<TechItem[]> = () => {
  const tech = inject(TechService);

  return tech.list().pipe(
    catchError(() => of([]))
  );
};