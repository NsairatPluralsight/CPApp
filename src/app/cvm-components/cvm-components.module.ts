import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CVMComponentsComponent } from './cvm-components.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CVMComponentsService } from './cvm-components.service';

@NgModule({
  declarations: [CVMComponentsComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule,
  ],
  providers: [
    CVMComponentsService,
  ],
  bootstrap: [CVMComponentsComponent],
})
export class CVMComponentsModule { }
