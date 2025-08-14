export class ReportScheduleModel {
  AppId: string;
  AppName: string;
  TenantId: string;
  ReportFormat: string;
  TemplateId: string;
  ReportId: string;
  ReportName: string;
  ReportDescription: string;
  UserId: string;
  ReportCreatedBy: string;
  ScheduleId: string;
  ScheduleCreatedBy: string;
  ScheduleInfo: {
    IsRepeat: boolean;  // once or recurrence(yes / no)
    IsMailSchedule: boolean;
    To: [];
    ToCc: [];
    ToBcc: [];
    ScheduleRecurrence: string; // Daily/Weekly/Monthly
    StartDate: Date;
    EndDate: Date;
    DaysOfWeek: [];
    Months: [];
    RecurrMonths: number;
    DayOfMonth: number;
    DayOfWeek: number; // SUNDAY-0/MONDAY-1/...
    TypeOfMonthly: string;
    TypeOfDay: string;
    WeekOfMonth: string;
  };
}
