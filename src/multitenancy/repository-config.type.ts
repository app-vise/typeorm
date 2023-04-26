import {
  EntityStampedSchemaFactory,
  Type,
  TypeormStampedReadRepository,
  TypeormStampedRepository,
  TypeormStampedWriteRepository,
} from '..';

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  customReadRepository?: TypeormStampedReadRepository;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  customWriteRepository?: TypeormStampedWriteRepository;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  customRepository?: TypeormStampedRepository;
  asyncDomainEvents?: boolean;
}
