export class DataLoadHistory {
  public constructor(init?: Partial<DataLoadHistory>) {
    Object.assign(this, init);
  }

  insertCount: number;
  updateCount: number;
  failedCount: number;
  historyId: number;
  startDT: Date;
  endDT: Date;
  datasourceId: number;
  dataSourceName: string;
  loadStatus: string;
  scheduleType: string;
}
