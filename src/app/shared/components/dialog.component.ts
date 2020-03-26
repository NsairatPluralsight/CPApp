import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CacheService } from '../services/cache.service';
import { LoggerService } from '../services/logger.service';
import { Constants } from '../models/constants';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  title: string;
  subTitle: string;
  message: string;
  cancelText: string;
  yesText: string;
  languageDirection: string;

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private cache: CacheService, private logger: LoggerService) {
    this.title = data['title'];
    this.subTitle = data['subTitle'];
    this.message = data['message'];
    this.cancelText = data['cancelText'];
    this.yesText = data['yesText'];
  }

  ngOnInit() {
    try {
      this.languageDirection = this.cache.getCurrentLanguage().rtl === 1 ? Constants.cRTL : Constants.cLTR;
    } catch (error) {
      this.logger.error(error);
    }
  }

}
