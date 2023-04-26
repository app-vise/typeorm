import { DataSource } from 'typeorm';

export default class DataSourceManager {
  private static instance: DataSourceManager;

  private dataSources: { [key: string]: DataSource };

  private constructor() {
    this.dataSources = {};
  }

  public static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }

    return DataSourceManager.instance;
  }

  async getDBDataSource(
    dataSourceName: string,
    tenantModels: any[]
  ): Promise<DataSource> {
    if (this.dataSources[dataSourceName]) {
      const dataSource = this.dataSources[dataSourceName];
      return Promise.resolve(
        dataSource.isInitialized ? dataSource : dataSource.initialize()
      );
    }

    const host = process.env['TENANT_DB_HOST'] ?? 'postgres';

    const newDataSource = new DataSource({
      type: ((<string>process.env['TENANT_DB_TYPE']) as any) ?? 'postgres',
      host,
      port: process.env['TENANT_DB_PORT']
        ? Number(process.env['TENANT_DB_PORT'])
        : 5432,
      database: dataSourceName,
      username: dataSourceName,
      password: <string>process.env['TENANT_DB_PASSWORD'] ?? 'password',
      ssl:
        process.env['TENANT_DB_SSL_CERT'] ?? false
          ? {
              rejectUnauthorized: false,
              ca: process.env['TENANT_DB_SSL_CERT'],
            }
          : false,
      synchronize: true,
      entities: tenantModels,
    });

    this.dataSources[dataSourceName] = newDataSource;

    return Promise.resolve(newDataSource.initialize());
  }
}
