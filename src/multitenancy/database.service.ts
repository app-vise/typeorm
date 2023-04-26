import { DataSource } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ConflictException } from '@appvise/domain';
import DataSourceManager from './datasource.manager';

export class DatabaseService {
  constructor(
    private readonly cls: ClsService,
    private readonly tenantModels: any[],
    private readonly tenantDatabases?: Map<string, string>,
    private readonly dbPrefix = 't_'
  ) {}

  async getDBDataSource(domain?: string): Promise<DataSource> {
    const identity = this.cls.get('identity');

    let tenantId: string | undefined;

    if (!identity || !identity.account?.id) {
      throw new ConflictException('No identity');
    }

    if (this.tenantDatabases) {
      // Get tenant database name identifier mapped by accountId
      tenantId = this.tenantDatabases.get(identity.account?.id);
    }

    if (!tenantId) {
      // Use accountId as database name by default
      tenantId = identity.account?.id;
    }

    return DataSourceManager.getInstance().getDBDataSource(
      `${this.dbPrefix}${domain ? domain + '_' : ''}${tenantId}`,
      this.tenantModels
    );
  }
}
