import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { SchedulesEditComponent } from './schedules-edit/schedules-edit.component';
import { SchedulesListComponent } from './schedules-list/schedules-list.component';
// import { SchedulesNewComponent } from './schedules-new/schedules-new.component';

const routes: Routes = [
  {
    path: "",
    component: SchedulesListComponent
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulesRoutingModule { }
