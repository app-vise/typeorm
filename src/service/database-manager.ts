import { UUID } from '@appvise/domain';

export abstract class DatabaseManager {
  abstract createDatabase(tenantId: UUID): Promise<string>;
  abstract deleteDatabase(tenantId: UUID): Promise<boolean>;
}
