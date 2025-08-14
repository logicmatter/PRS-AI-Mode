export class EqpLocObj {
  ID: number;
  Site: string;
  Location: string;
  EquipmentName: string;
  PointType: string;
  PointSID: number;
  roomID: string;
  ProfileSID: number;
  StandardSID: number;
  classTypeID: number;
  classType: string;
  AlarmLookUpObj: alrmlookUpPointStds[];
  TrendlogLookUpObj: trndlookUpPointStds[];
  EnergylogLookUpObj: energylookUpPointStds[];
}
export class alrmlookUpPointStds {
  PointSID: number;
  StandardSID: number;
}
export class trndlookUpPointStds {
  PointSID: number;
  StandardSID: number;
}
export class energylookUpPointStds {
  PointSID: number;
  StandardSID: number;
}

