import { AggregateRoot, Entity, Logger } from '@appvise/domain';
import {
  EntitySchemaFactory,
  EntityBaseSchema,
  TypeormReadRepository,
  TypeormRepository,
  TypeormWriteRepository,
} from '../index';
import { DataSource } from 'typeorm';

// instead of import { Type } from '@nestjs/common';
export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export class TypeormRepositoryProvider {
  static provide<
    TRepository,
    TEntity extends AggregateRoot<unknown> | Entity<unknown>,
    TEntitySchema extends EntityBaseSchema,
    TEntitySchemaFactory extends EntitySchemaFactory<TEntity, TEntitySchema>
  >(
    repository: TRepository,
    schemaType: Type<TEntitySchema>,
    schemaFactory: TEntitySchemaFactory,
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
          return new TypeormReadRepository<TEntity, TEntitySchema>(
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
          return new TypeormWriteRepository<TEntity, TEntitySchema>(
            connection.getRepository(schemaType),
            schemaFactory,
            schemaType,
            logger,
            asyncDomainEvents
          );
        }

        // Otherwise, return read + write combined repository
        return new TypeormRepository<TEntity, TEntitySchema>(
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
