import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from "@angular/material/dialog";
import { CoreUtilityService } from '../../PmCore/shared/core-utility.service';
import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { SchedulerService } from 'src/app/PmCore/services/SchedulerService/scheduler.service';
import { stringify } from 'querystring';

@Component({
  selector: 'app-scheduled-files-dialog',
  templateUrl: './scheduled-files-dialog.component.html',
  styleUrls: ['./scheduled-files-dialog.component.scss']
})
export class ScheduledFilesDialogComponent implements OnInit {
  pageSize = 2;
  p1;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  config: { currentPage: number; itemsPerPage: number };
  filter = '';
  constructor(private dialogRef: MatDialogRef<ScheduledFilesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public coreService: CoreUtilityService,
    public dialog: MatDialog,
    private schedulerService: SchedulerService,) {

    this.filter = '';
    this.config = {
      currentPage: 1,
      itemsPerPage: 5
    };
  }

  ngOnInit() {
  }

  filterBy(prop: string) {
    return this.data.scheduledFiles.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }

  download(fileObj: any) {
    const arrayBuffer = this.base64ToArrayBuffer(fileObj.fileContent);
    this.createAndDownloadBlobFile(arrayBuffer, fileObj.fileName);
  }
  base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64); // Comment this if not using base64
    const bytes = new Uint8Array(binaryString.length);
    return bytes.map((byte, i) => binaryString.charCodeAt(i));
  }
  createAndDownloadBlobFile(body, fileName) {
    const blob = new Blob([body]);
    if ((navigator as any).msSaveBlob) {
      // IE 10+
      (navigator as any).msSaveBlob(blob, fileName);
    } else {
      const link = document.createElement('a');

      // Browsers that support the 'download' attribute
      if ('download' in link) {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
  deletes(fileObj: any) {
    // const a = this.data.scheduledFiles.length-1
    if (this.data.scheduledFiles !== null) {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "500px",
        data: {
          id: 0,
          type: fileObj.fileName,
          message:
            "Are you sure, you want to delete this Latest Report <b>" +
            fileObj.fileName +
            "</b>?",
          action: "Delete",
          title: "Warning",


        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.schedulerService.DeleteReportsScheduledFiles(fileObj.filePath).subscribe(
            data => {
              this.schedulerService.showSuccess("Deleted Successfully");
              this.dialog.closeAll();
            },
            error => {
              this.schedulerService.showError("Error : Something went wrong.");
              this.dialog.closeAll();
            })

        } else {
          //console.log(result, "The dialog was closed");
        }
        //this.deleteReport(id);
        ////console.log(result, "The dialog was closed");
        //this.animal = result;
      });
    } else {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "900px",
        data: {
          id: 0,
          type: fileObj.reportName,
          message: "Report owner is only allowed to delete",
          action: "Warning",
          title: "Warning"
        }
      });
    }
  }
}
