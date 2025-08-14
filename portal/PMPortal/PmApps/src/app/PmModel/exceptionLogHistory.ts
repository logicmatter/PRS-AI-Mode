export class ExceptionLogHistory {
  public constructor(init?: Partial<ExceptionLogHistory>) {
    Object.assign(this, init);
  }

  exceptionMsg: string;
  exceptionType: string;
  exceptionSource: string;
  connectorType: string;
  logdate: Date;
  datasourceId: number;
  dataSourceName: string;
}
