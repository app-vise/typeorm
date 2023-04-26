import { EntityStampedSchemaFactory, Type } from '..';

export interface RepositoryConfig {
  // TODO: Make work with types
  //   class:
  //     | typeof ReadRepository<any>
  //     | typeof WriteRepository<any>
  //     | typeof Repository<any>;
  class: any; // typeof ReadRepository<any> | typeof WriteRepository<any> | typeof Repository<any>;
  schema: Type;
  factory: EntityStampedSchemaFactory<any, any>;
  // TODO: Make work with typeof + generic types
  //   customReadRepository?: typeof TypeormStampedReadRepository<any, any>;
  //   customWriteRepository?: typeof TypeormStampedWriteRepository<any, any>;
  //   customRepository?: typeof TypeormStampedRepository<any, any>;
  customReadRepository?: any;
  customWriteRepository?: any;
  customRepository?: any;
  asyncDomainEvents?: boolean;
}
