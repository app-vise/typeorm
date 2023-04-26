import { ConflictException, Logger, RepositoryService } from '@appvise/domain';
import { ClsService } from 'nestjs-cls';
import { DatabaseService } from './database.service';
import RepositoryManager from './repository.manager';
import { RepositoryConfig } from './repository-config.type';

export class TypeormRepositoryService implements RepositoryService {
  constructor(
    private readonly cls: ClsService,
    private readonly databaseService: DatabaseService,
    private readonly logger: Logger,
    private readonly reposConfig: RepositoryConfig[]
  ) {}

  async getRepository<TRepository>(repositoryClass: TRepository): Promise<any> {
    const identity = this.cls.get('identity');

    if (!identity || !identity.account) {
      throw new ConflictException('No identity');
    }

    const repoConfig = this.reposConfig.find((configItem) => {
      let configRepoName = configItem.class.toString().substring(6);
      configRepoName = configRepoName.substring(0, configRepoName.indexOf(' '));

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let repositoryClassName = repositoryClass.toString().substring(6);
      repositoryClassName = repositoryClassName.substring(
        0,
        repositoryClassName.indexOf(' ')
      );

      return configRepoName === repositoryClassName;
    });

    if (!repoConfig) {
      throw new ConflictException('Repository not configured');
    }

    const dataSource = await this.databaseService.getDBDataSource();

    return RepositoryManager.getInstance().getRepository(
      dataSource,
      identity.account.id,
      repoConfig,
      this.logger
    );
  }
}
