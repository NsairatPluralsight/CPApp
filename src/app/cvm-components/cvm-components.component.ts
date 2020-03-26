import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatPaginatorIntl, PageEvent, MatDialog } from '@angular/material';
import { LoggerService } from '../shared/services/logger.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { CVMComponent } from '../shared/models/cvm-component';
import { Branch } from '../shared/models/branch';
import { CVMComponentsService } from './cvm-components.service';
import { Result, Error, PermissionType, InternalStatus } from '../shared/models/enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EventsService } from '../shared/services/events.service';
import { StateService } from '../shared/services/state.service';
import { CVMComponentType } from '../shared/models/cvm-component-type';
import { Constants } from '../shared/models/constants';
import { Filter } from '../shared/models/filter';
import { Subscription } from "rxjs";
import { DialogComponent } from '../shared/components/dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { CacheService } from '../shared/services/cache.service';

@Component({
  selector: 'app-cvm-components',
  templateUrl: './cvm-components.component.html',
  styleUrls: ['./cvm-components.component.css']
})
export class CVMComponentsComponent implements OnInit, OnDestroy {
  displayedColumns = [Constants.cNAME, Constants.cADDRESS, 'Branch', Constants.cTYPE, Constants.cIDENTITY];
  branches: Branch[];
  types: CVMComponentType[];
  count: number;
  all: string;
  identity: string;
  name: string;
  ipAddress: string;
  noData: string;
  branchesCaption: string;
  branchCaption: string;
  componentType: string;
  filterCaption: string;
  branchesDisabled: string;
  typeCaption: string;
  devicesForm: FormGroup;
  dataSource: MatTableDataSource<CVMComponent>;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  pageEvent: PageEvent;
  filter: Filter;
  private subscription: Subscription;
  languageIndex: string;
  showTable = false;
  showLoader = true;
  isReady = false;
  disableBranches = false;
  canEdit = true;
  optionAll = Constants.cALL;

  constructor(public componentsService: CVMComponentsService, private logger: LoggerService, public languageService: MultilingualService,
    private fb: FormBuilder, private eventService: EventsService, private stateService: StateService, private cdRef: ChangeDetectorRef,
    public matPaginator: MatPaginatorIntl, public dialog: MatDialog, private route: ActivatedRoute, private commonService: CommonActionsService,
    public router: Router, private cache: CacheService) {
    this.listenToEvents();
    this.getPermition();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.devicesForm = this.fb.group({
        branche: [0],
        type: [this.optionAll]
      });

      let result = await this.componentsService.initialize();

      if (result == Result.Success) {
        this.branches = this.componentsService.branches;
        this.types = this.componentsService.types;
        this.count = this.componentsService.count;
        this.languageIndex = this.cache.getCurrentLanguage().index;

        await this.getDevices(true);
      } else {
          this.showError(Error.General);
      }

      this.isReady = this.stateService.getStatus() === InternalStatus.Ready;
      this.loadCaptions();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - gets the components
   * @param {boolean} isFirstTime - it hase been called from ngOnInit or not
   */
  async getDevices(isFirstTime: boolean): Promise<void> {
    try {
      this.showLoader = true;
      let branchID = this.disableBranches ? -1 : this.devicesForm.get(Constants.cBRANCHE).value;
      let type = this.devicesForm.get(Constants.cTYPE.toLowerCase()).value.toLowerCase() == this.optionAll.toLowerCase() ? null : this.devicesForm.get(Constants.cTYPE.toLowerCase()).value;
      let pageIndex = this.paginator ? this.paginator.pageIndex : 0;
      let columnName = this.getColumnName();

      this.componentsService.getDevices(pageIndex, columnName, branchID, type, this.filter).then((devices: CVMComponent[]) => {
        if (devices) {
          devices.map((device) => {
            device.branch = this.branches.find((branche) => branche.id === device.queueBranch_ID).name;
          });
          this.dataSource = new MatTableDataSource(devices);
          this.showTable = true;
      }
      this.listeningToFormEvents(isFirstTime);
      this.showLoader = false;
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - gets the filter from search and apply it on the devices
   * @param value - search text
   */
  async applyFilter(value: string): Promise<void> {
    try {
      this.filter = new Filter();
      this.filter.text = value;

      await this.getDevices(false);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - get the text caption for the component
   */
  loadCaptions(): void {
    try {
      this.all = this.languageService.getCaption(Constants.cALL);
      this.identity = this.languageService.getCaption(Constants.cIDENTITY);
      this.name = this.languageService.getCaption(Constants.cNAME);
      this.ipAddress = this.languageService.getCaption(Constants.cADDRESS);
      this.noData = this.languageService.getCaption(Constants.cNO_DATA);
      this.branchesCaption = this.languageService.getCaption(Constants.cBRANCHEs);
      this.componentType = this.languageService.getCaption(Constants.cTYPE_NAME);
      this.filterCaption = this.languageService.getCaption(Constants.cFilter);
      this.branchesDisabled = this.languageService.getCaption(Constants.cBRANCHES_DISABLED);
      this.typeCaption = this.languageService.getCaption(Constants.cTYPE);
      this.branchCaption = this.languageService.getCaption(Constants.cBRANCH);
      this.matPaginator.itemsPerPageLabel = this.languageService.getCaption(Constants.cITEMS_PER_PAGE);
      this.matPaginator.firstPageLabel = this.languageService.getCaption(Constants.cFIRST_PAGE);
      this.matPaginator.lastPageLabel = this.languageService.getCaption(Constants.cLAST_PAGE);
      this.matPaginator.nextPageLabel = this.languageService.getCaption(Constants.cNEXT_PAGE);
      this.matPaginator.previousPageLabel = this.languageService.getCaption(Constants.cPREVIOUS_PAGE);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - subscribe to the form events
   * @param isFirstTime - to decide whether to subscribe or not
   */
  listeningToFormEvents(isFirstTime: boolean): void {
    try {
      if (isFirstTime) {
       const brancheChange = this.devicesForm.get(Constants.cBRANCHE).valueChanges.subscribe(
          () => this.getDevices(false)
        );
        this.subscription.add(brancheChange);

        const typeChange = this.devicesForm.get(Constants.cTYPE.toLowerCase()).valueChanges.subscribe(
          () => this.getDevices(false)
        );
        this.subscription.add(typeChange);

        const sortChange = this.sort.sortChange.subscribe(() => this.getDevices(false));
        this.subscription.add(sortChange);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - get the comlumn wich will be used to sort and the direction of the sort
   * @returns {string} - the column name and the sorting direction as string
   */
  getColumnName(): string {
    try {
      let columnName = null;
      if (this.sort) {
        if (this.sort.active && this.sort.direction) {
          columnName = this.sort.active;
          switch (this.sort.active) {
            case Constants.cTYPE:
              columnName = Constants.cTYPE_NAME;
              break;
            case Constants.cNAME:
              columnName = `${Constants.cNAME}_L${this.languageIndex}`;
              break;
          }
          columnName += '.' + this.sort.direction;
        }
      }

      return columnName;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - opens an error dialog
   * @param {number} errorCode - the code of error to get the caption
   */
  async showError(errorCode: number): Promise<void> {
    try {
      let error = this.commonService.getErrorCaption(errorCode);

      await this.openDialog(Constants.cERROR, '', error, '', Constants.cOK);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - shows a pop up dialog with sent values
   * @param {string} title - the dialog title
   * @param {string} subTitle - the dialog sub title
   * @param {string} message - the dialog message
   * @param {string} cancelText - the cancel button text
   * @param {string} yesText - the yes button text
   * @param {any} callBack - optional function to call after confirmation
   */
  async openDialog(title: string, subTitle: string, message: string, cancelText: string, yesText: string, callBack?: any): Promise<void> {
    try {
      let dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: title,
          subTitle: subTitle,
          message: message,
          cancelText: cancelText,
          yesText: yesText
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (callBack) {
          callBack(result);
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - get if user has edit permition
   */
  async getPermition(): Promise<void> {
    try {
      this.canEdit = await this.commonService.checkPermission(PermissionType.Edit);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   *
   * @param pageName
   * @param componentID
   */
  editComponent(pageName: string, componentID: number) {
    try {
      //if (this.canEdit) {
        this.router.navigate(['/' + pageName, componentID])
      //}
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - subscribes to events
   */
  listenToEvents() {
    try {

      this.subscription = this.eventService.statusUpdate.subscribe((state) => {
        setTimeout(() => {
          this.isReady = state === InternalStatus.Ready;
          if (this.isReady) {
            this.loadCaptions();
            this.cdRef.detectChanges();
          }
        });
      });

      const languageChangedSub = this.eventService.languageChanged.subscribe(() => {
        this.loadCaptions();
        if (!this.cdRef[Constants.cDESTROYED]) {
          this.cdRef.detectChanges();
        }
      });
      this.subscription.add(languageChangedSub);

      const routeSub = this.route.queryParams.subscribe(async params => {
        if (params && params.error) {
          await this.showError(parseInt(params.error));
        }
      });
      this.subscription.add(routeSub);

      const unAuthorizedActionSub = this.eventService.unAuthorizedAction.subscribe((entityName) => {
        if (entityName && entityName === Constants.cBRANCHE) {
          this.disableBranches = true;
        }
      });
      this.subscription.add(unAuthorizedActionSub);

      const rebootSub = this.eventService.reboot.subscribe(() => {
        this.ngOnInit();
      });
      this.subscription.add(rebootSub);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - unsubscribes to events
   */
  ngOnDestroy(): void {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
