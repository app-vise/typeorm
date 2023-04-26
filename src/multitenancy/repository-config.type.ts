import { ReadRepository, Repository, WriteRepository } from '@appvise/domain';
import {
  EntityStampedSchemaFactory,
  Type,
  TypeormStampedReadRepository,
  TypeormStampedRepository,
  TypeormStampedWriteRepository,
} from '..';

export interface RepositoryConfig {
  class:
    | typeof ReadRepository<any>
    | typeof WriteRepository<any>
    | typeof Repository<any>;
  schema: Type;
  factory: EntityStampedSchemaFactory<any, any>;
  customReadRepository?: typeof TypeormStampedReadRepository<any, any>;
  customWriteRepository?: typeof TypeormStampedWriteRepository<any, any>;
  customRepository?: typeof TypeormStampedRepository<any, any>;
  asyncDomainEvents?: boolean;
}
