import { Logger } from '@appvise/domain';
import { DataSource } from 'typeorm';
import {
  TypeormStampedReadRepository,
  TypeormStampedRepository,
  TypeormStampedWriteRepository,
} from '..';
import { RepositoryConfig } from './repository-config.type';

export default class RepositoryManager {
  private static instance: RepositoryManager;

  private repositories: {
    [key: string]: any;
  };

  constructor() {
    this.repositories = {};
  }

  public static getInstance(): RepositoryManager {
    if (!RepositoryManager.instance) {
      RepositoryManager.instance = new RepositoryManager();
    }

    return RepositoryManager.instance;
  }

  async getRepository(
    dataSource: DataSource,
    tenantId: string,
    repositoryConfig: RepositoryConfig,
    logger: Logger
  ): Promise<any> {
    // Get repository class name
    let repositoryName = repositoryConfig.class.toString().substring(6);
    repositoryName = repositoryName.substring(0, repositoryName.indexOf(' '));

    // Prefix with datasource name for tenant
    repositoryName = `${tenantId}-${repositoryName}`;

    logger.debug(`RepositoryManager.getRepository for ${repositoryName}`);

    if (this.repositories[repositoryName]) {
      const repository = this.repositories[repositoryName];
      return Promise.resolve(repository);
    }

    let newRepository;

    if (repositoryName.includes('ReadRepository')) {
      if (repositoryConfig.customReadRepository) {
        newRepository = new repositoryConfig.customReadRepository(
          dataSource.getRepository(repositoryConfig.schema),
          repositoryConfig.factory,
          repositoryConfig.schema
        );
      } else {
        newRepository = new TypeormStampedReadRepository<any, any>(
          dataSource.getRepository(repositoryConfig.schema),
          repositoryConfig.factory,
          repositoryConfig.schema
        );
      }
    } else if (repositoryName.includes('WriteRepository')) {
      if (repositoryConfig.customWriteRepository) {
        newRepository = new repositoryConfig.customWriteRepository(
          dataSource.getRepository(repositoryConfig.schema),
          repositoryConfig.factory,
          repositoryConfig.schema,
          logger,
          repositoryConfig.asyncDomainEvents
        );
      } else {
        newRepository = new TypeormStampedWriteRepository<any, any>(
          dataSource.getRepository(repositoryConfig.schema),
          repositoryConfig.factory,
          repositoryConfig.schema,
          logger,
          repositoryConfig.asyncDomainEvents
        );
      }
    } else {
      // Otherwise, return read + write combined repository
      if (repositoryConfig.customRepository) {
        newRepository = new repositoryConfig.customRepository(
          dataSource.getRepository(repositoryConfig.schema),
          repositoryConfig.factory,
          repositoryConfig.schema,
          logger,
          repositoryConfig.asyncDomainEvents
        );
      } else {
        newRepository = new TypeormStampedRepository<any, any>(
          dataSource.getRepository(repositoryConfig.schema),
          repositoryConfig.factory,
          repositoryConfig.schema,
          logger,
          repositoryConfig.asyncDomainEvents
        );
      }
    }

    logger.debug(`NewRepository initialized ${newRepository.constructor.name}`);

    this.repositories[repositoryName] = newRepository;

    return Promise.resolve(newRepository);
  }
}
