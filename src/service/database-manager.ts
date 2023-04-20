export abstract class DatabaseManager {
  abstract createDatabase(tenantId: string): Promise<string>;
  abstract deleteDatabase(tenantId: string): Promise<boolean>;
}
