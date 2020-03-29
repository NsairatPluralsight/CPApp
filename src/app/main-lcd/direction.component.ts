import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Constants } from '../shared/models/constants';
import { LoggerService } from '../shared/services/logger.service';
import { MultilingualService } from '../shared/services/multilingual.service';

@Component({
  selector: 'app-direction',
  templateUrl: './direction.component.html',
  styleUrls: ['./direction.component.css'],
})
export class DirectionComponent {
  public title: string;
  constructor(private logger: LoggerService, private languageService: MultilingualService, public dialogRef: MatDialogRef<DirectionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
      this.loadCaptions();
    }

  public close(value: number) {
    this.data[Constants.cDIRECTION] = value;
    this.dialogRef.close(this.data);
  }

  public loadCaptions(): void {
    try {
      this.title = this.languageService.getCaption(Constants.cDIRECTION_DIALOG_TITLE);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
