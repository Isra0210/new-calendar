import { NgModule } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { ContentComponent } from './layout/content/content.component';
import { FormComponent } from './layout/form/form.component';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

const toastrConfig = {
  maxOpened: 1,
  timeOut: 3000,
  enableHtml: true,
  autoDismiss: true,
  preventDuplicates: true,
  positionClass: 'toast-top-right',
};

@NgModule({
  declarations: [HeaderComponent, ContentComponent, FormComponent],
  imports: [
    RouterModule,
    HttpClientModule,
    NgxSpinnerModule,
    MatToolbarModule,
    ReactiveFormsModule,
		MatFormFieldModule,
    ToastrModule.forRoot(toastrConfig),
  ],
  exports: [HeaderComponent, ContentComponent, FormComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ExceptionInterceptor, multi: true },
  ],
})
export class CoreModule {}
