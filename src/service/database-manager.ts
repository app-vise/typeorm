import { UUID } from '@appvise/domain';

export enum ExtraDBTypes {
  IAM = 'iam',
}

export abstract class DatabaseManager {
  abstract createMainDatabase(tenantId: UUID): Promise<string>;
  abstract deleteMainDatabase(tenantId: UUID): Promise<boolean>;
  abstract createExtraDatabase(
    tenantId: UUID,
    type: ExtraDBTypes
  ): Promise<string>;
  abstract deleteExtraDatabase(
    tenantId: UUID,
    type: ExtraDBTypes
  ): Promise<boolean>;
}
