/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateEntityProps, Entity, ID } from '@appvise/domain';
import { BareEntitySchema } from './bare-entity.schema';

export type BareEntitySchemaProps<TEntitySchema> = Omit<TEntitySchema, 'id'>;

export interface BareEntityProps<TEntityProps> {
  id: ID;
  props: TEntityProps;
}

export abstract class BareEntitySchemaFactory<
  TEntity extends Entity<unknown>,
  TEntitySchema extends BareEntitySchema
> {
  constructor(
    private entityConstructor: new (props: CreateEntityProps<any>) => TEntity,
    private entitySchemaConstructor: new (
      props: BareEntitySchemaProps<TEntitySchema>
    ) => TEntitySchema
  ) {}

  protected abstract toDomainProps(
    entitySchema: TEntitySchema
  ): BareEntityProps<unknown>;

  protected abstract toSchemaProps(
    entity: TEntity
  ): BareEntitySchemaProps<TEntitySchema>;

  toDomain(entitySchema: TEntitySchema): TEntity {
    const { id, props } = this.toDomainProps(entitySchema);
    return new this.entityConstructor({
      id,
      props,
    });
  }

  toSchema(entity: TEntity): TEntitySchema {
    const props = this.toSchemaProps(entity);
    return new this.entitySchemaConstructor({
      ...props,
      id: entity.id.value,
    });
  }
}
