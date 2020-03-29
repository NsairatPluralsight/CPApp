import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
})
export class SpinnerComponent implements OnInit {
  @Input() public isVisible: boolean;

  // tslint:disable: no-empty
  constructor() { }

  public ngOnInit() {  }
}
