import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationService } from './services/communication.service';
import { LoggerService } from './services/logger.service';
import { CommunicationManagerService } from './services/communication-manager.service';
import { DialogComponent } from './components/dialog.component';
import { MaterialModule } from '../material/material.module';
import { MultilingualService } from './services/multilingual.service';
import { StateService } from './services/state.service';
import { SpinnerComponent } from './components/spinner.component';
import { UserMenuComponent } from './components/user-menu.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [DialogComponent, SpinnerComponent, UserMenuComponent],
  providers:[
    CommunicationService,
    LoggerService,
    CommunicationManagerService,
    StateService,
    MultilingualService
  ],
  exports:[
    DialogComponent,
    SpinnerComponent,
    UserMenuComponent
  ],
  entryComponents:[DialogComponent]
})
export class SharedModule { }
