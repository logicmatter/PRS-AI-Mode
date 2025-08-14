export class Complianceprofile {
    
appID : string;
classType : string;
id : number;
profile : string;
profileName : string;
siteName : string;
standardID : number;
Site: string;
facetID : number;
facetName : string;
ruleCode : string;
standardName : string;
compilanceprofile : CompilanceprofileStds[];
}

export class CompilanceprofileStds {
    Site: string;
    classType : string;
    facetID : number;
    facetName : string;
    ruleCode : string;
    standardName : string;
    standardID : number;
    
    
    
  }
