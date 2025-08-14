export class ConnectorsList {
  public constructor(init?: Partial<ConnectorsList>) {
    Object.assign(this, init);
  }

  connectorId: string;
  connectorName: string;
  isActive: boolean;
}
