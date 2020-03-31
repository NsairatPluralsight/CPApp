import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatPaginatorIntl, PageEvent, MatDialog } from '@angular/material';
import { LoggerService } from '../shared/services/logger.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { Branch } from '../shared/models/branch';
import { CVMComponentsService } from './cvm-components.service';
import { Result, Error, PermissionType, InternalStatus } from '../shared/models/enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EventsService } from '../shared/services/events.service';
import { StateService } from '../shared/services/state.service';
import { CVMComponentType } from '../shared/models/cvm-component-type';
import { Constants } from '../shared/models/constants';
import { Filter } from '../shared/models/filter';
import { Subscription } from 'rxjs';
import { DialogComponent } from '../shared/components/dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { CacheService } from '../shared/services/cache.service';
import { UICVMComponent } from '../shared/models/ui-cvm-component';

@Component({
  selector: 'app-cvm-components',
  templateUrl: './cvm-components.component.html',
  styleUrls: ['./cvm-components.component.css'],
})
export class CVMComponentsComponent implements OnInit, OnDestroy {
  public displayedColumns = [Constants.cNAME, Constants.cADDRESS, Constants.cBRANCH, Constants.cTYPE, Constants.cIDENTITY];
  public branches: Branch[];
  public types: CVMComponentType[];
  public count: number;
  public all: string;
  public identity: string;
  public name: string;
  public ipAddress: string;
  public noData: string;
  public branchesCaption: string;
  public branchCaption: string;
  public componentType: string;
  public filterCaption: string;
  public branchesDisabled: string;
  public typeCaption: string;
  public devicesForm: FormGroup;
  public dataSource: MatTableDataSource<UICVMComponent>;
  @ViewChild(MatSort, {static: false}) public sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) public paginator: MatPaginator;
  public pageEvent: PageEvent;
  public filter: Filter;
  public languageIndex: string;
  public showTable = false;
  public showLoader = true;
  public isReady = false;
  public disableBranches = false;
  public canEdit = true;
  public optionAll = Constants.cALL;
  private subscription: Subscription;

  constructor(public componentsService: CVMComponentsService, private logger: LoggerService, public languageService: MultilingualService,
              private fb: FormBuilder, private eventService: EventsService, private stateService: StateService, private cdRef: ChangeDetectorRef,
              public matPaginator: MatPaginatorIntl, public dialog: MatDialog, private route: ActivatedRoute, private commonService: CommonActionsService,
              public router: Router, private cache: CacheService) {
    this.listenToEvents();
    this.getPermition();
  }

  public async ngOnInit(): Promise<void> {
    try {
      this.devicesForm = this.fb.group({
        branche: [0],
        type: [this.optionAll],
      });

      const tResult = await this.componentsService.initialize();

      if (tResult === Result.Success) {
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
  public async getDevices(isFirstTime: boolean): Promise<void> {
    try {
      this.showLoader = true;
      const tBranchID = this.disableBranches ? -1 : this.devicesForm.get(Constants.cBRANCHE).value;
      const tType = this.devicesForm.get(Constants.cTYPE.toLowerCase()).value.toLowerCase() === this.optionAll.toLowerCase() ? null :
       this.devicesForm.get(Constants.cTYPE.toLowerCase()).value;
      const tPageIndex = this.paginator ? this.paginator.pageIndex : 0;
      const tColumnName = this.getColumnName();

      this.componentsService.getDevices(tPageIndex, tColumnName, tBranchID, tType, this.filter).then((devices: UICVMComponent[]) => {
        if (devices) {
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
  public async applyFilter(pValue: string): Promise<void> {
    try {
      this.filter = new Filter();
      this.filter.text = pValue;
      await this.getDevices(false);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - get the text caption for the component
   */
  public loadCaptions(): void {
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
  public listeningToFormEvents(pIsFirstTime: boolean): void {
    try {
      if (pIsFirstTime) {
       const tBrancheChange = this.devicesForm.get(Constants.cBRANCHE).valueChanges.subscribe(
          () => this.getDevices(false),
        );
       this.subscription.add(tBrancheChange);

       const tTypeChange = this.devicesForm.get(Constants.cTYPE.toLowerCase()).valueChanges.subscribe(
          () => this.getDevices(false),
        );
       this.subscription.add(tTypeChange);

       const tSortChange = this.sort.sortChange.subscribe(() => this.getDevices(false));
       this.subscription.add(tSortChange);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - get the comlumn wich will be used to sort and the direction of the sort
   * @returns {string} - the column name and the sorting direction as string
   */
  public getColumnName(): string {
    try {
      let tColumnName = null;
      if (this.sort && this.sort.active && this.sort.direction) {
          tColumnName = this.sort.active;
          switch (this.sort.active) {
            case Constants.cTYPE:
              tColumnName = Constants.cTYPE_NAME;
              break;
            case Constants.cNAME:
              tColumnName = `${Constants.cNAME}_L${this.languageIndex}`;
              break;
          }
          tColumnName += '.' + this.sort.direction;
        }
      return tColumnName;
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
  public async showError(pErrorCode: number): Promise<void> {
    try {
      const tError = this.commonService.getErrorCaption(pErrorCode);
      await this.openDialog(Constants.cERROR, '', tError, '', Constants.cOK);
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
  public async openDialog(pTitle: string, pSubTitle: string, pMessage: string, pCancelText: string, pYesText: string, pCallBack?: any): Promise<void> {
    try {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: pTitle,
          subTitle: pSubTitle,
          message: pMessage,
          cancelText: pCancelText,
          yesText: pYesText,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (pCallBack) {
          pCallBack(result);
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
  public async getPermition(): Promise<void> {
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
  public editComponent(pPageName: string, pComponentID: number) {
    try {
      this.router.navigate(['/' + pPageName, pComponentID]);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - subscribes to events
   */
  public listenToEvents() {
    try {
      this.subscription = this.eventService.statusUpdate.subscribe((state) => {
        this.handleStatusUpdate(state);
      });

      const tLanguageChangedSub = this.eventService.languageChanged.subscribe(() => {
        this.handleLanguageChange();
      });
      this.subscription.add(tLanguageChangedSub);

      const tRouteSub = this.route.queryParams.subscribe(async (params) => {
        if (params && params.error) {
          await this.showError(parseInt(params.error, 0));
        }
      });
      this.subscription.add(tRouteSub);

      const tUnAuthorizedActionSub = this.eventService.unAuthorizedAction.subscribe((entityName) => {
        if (entityName && entityName === Constants.cBRANCHE) {
          this.disableBranches = true;
        }
      });
      this.subscription.add(tUnAuthorizedActionSub);

      const tRebootSub = this.eventService.reboot.subscribe(() => {
        this.ngOnInit();
      });
      this.subscription.add(tRebootSub);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - unsubscribes to events
   */
  public ngOnDestroy(): void {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.logger.error(error);
    }
  }

  public handleStatusUpdate(pState: InternalStatus): void {
    try {
      setTimeout(() => {
        this.isReady = pState === InternalStatus.Ready;
        if (this.isReady) {
          this.loadCaptions();
          this.cdRef.detectChanges();
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  public handleLanguageChange() {
    try {
      this.loadCaptions();
      if (!this.cdRef[Constants.cDESTROYED]) {
        this.cdRef.detectChanges();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
