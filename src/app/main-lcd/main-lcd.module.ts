import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainLCDService } from './services/main-lcd.service';
import { MainLCDComponent } from './main-lcd.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectionComponent } from './direction.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ReactiveFormsModule,
    MaterialModule
    ],
  declarations: [MainLCDComponent, DirectionComponent],
  providers: [MainLCDService],
  entryComponents:[DirectionComponent],
  bootstrap: [MainLCDComponent]
})
export class MainLCDModule { }
