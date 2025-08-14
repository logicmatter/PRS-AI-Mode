import { Facet } from "./facet";
export class StandardObj {
  SID: number;
  StandardID: StandardObj;
  RuleCode: string;
  Regulation: string;
  Facet: Facet;
  FacetUnit: string;
  Criteria: string;
  AcceptableLow: number;
  AcceptableHigh: number;
  AppId: string;
}
