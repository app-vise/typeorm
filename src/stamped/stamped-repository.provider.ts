import { AggregateRoot, Entity, Logger } from '@appvise/domain';
import { DataSource } from 'typeorm';
import {
  EntityStampedSchemaFactory,
  EntityBaseStampedSchema,
  TypeormStampedReadRepository,
  TypeormStampedRepository,
  TypeormStampedWriteRepository,
  Type,
} from '../index';

export class TypeormStampedRepositoryProvider {
  static provide<
    TRepository,
    TEntity extends AggregateRoot<unknown> | Entity<unknown>,
    TEntitySchema extends EntityBaseStampedSchema,
    TEntityStampedSchemaFactory extends EntityStampedSchemaFactory<
      TEntity,
      TEntitySchema
    >
  >(
    repository: TRepository,
    schemaType: Type<TEntitySchema>,
    schemaFactory: TEntityStampedSchemaFactory,
    asyncDomainEvents?: boolean
  ) {
    return {
      provide: repository,
      useFactory: (connection: DataSource, logger: Logger) => {
        // Check if ReadRepository is implemented
        // TODO: Found other way to find out which repo should be loaded
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (repository.toString().includes('ReadRepository')) {
          return new TypeormStampedReadRepository<TEntity, TEntitySchema>(
            connection.getRepository(schemaType),
            schemaFactory,
            schemaType
          );
        }

        // Check if WriteRepository is implemented
        // TODO: Found other way to find out which repo should be loaded
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (repository.toString().includes('WriteRepository')) {
          return new TypeormStampedWriteRepository<TEntity, TEntitySchema>(
            connection.getRepository(schemaType),
            schemaFactory,
            schemaType,
            logger,
            asyncDomainEvents
          );
        }

        // Otherwise, return read + write combined repository
        return new TypeormStampedRepository<TEntity, TEntitySchema>(
          connection.getRepository(schemaType),
          schemaFactory,
          schemaType,
          logger,
          asyncDomainEvents
        );
      },
      inject: [DataSource, Logger],
    };
  }
}
