export class EnvLocObj {
  ID: number;
  Site: string;
  Location: string;
  PointType: string;
  PointSID: number;
  ProfileSID: number;
  StandardSID: number;
  classTypeID: number;
  classType: string;
  roomName: string;
  roomID: string;
  location: string;
  // lookUpObj: lookUpPointStds[];
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
// export class lookUpPointStds {
//   PointSID: number;
//   StandardSID: number;
// }
