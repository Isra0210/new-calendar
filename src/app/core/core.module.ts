import { NgModule } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { ContentComponent } from './layout/content/content.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DialogComponent } from './layout/dialog/dialog.component';

const toastrConfig = {
  maxOpened: 1,
  timeOut: 3000,
  enableHtml: true,
  autoDismiss: true,
  preventDuplicates: true,
  positionClass: 'toast-top-right'
}

@NgModule({
  declarations: [
    HeaderComponent,
    ContentComponent,
  ],
  imports: [
    RouterModule,
    HttpClientModule,
    NgxSpinnerModule,
		MatToolbarModule,
    ToastrModule.forRoot(toastrConfig)
  ],
  exports: [
    HeaderComponent,
    ContentComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ExceptionInterceptor, multi: true }
  ]
})
export class CoreModule { }
