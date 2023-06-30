import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'schedules',
    loadChildren: () =>
      import('./pages/schedules/schedules.module').then(
        (m) => m.SchedulesModule
      ),
  },
  {
    path: '**',
    redirectTo: '/schedules',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
