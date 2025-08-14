export class SourceFiles {
  public constructor(init?: Partial<SourceFiles>) {
    Object.assign(this, init);
  }

  subscriptionFile: File;
  defineFlow: string; // templateId
  subscriptionFileName: string;
  subscriptionFileLocation: string;
}
