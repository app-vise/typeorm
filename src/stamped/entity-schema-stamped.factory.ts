/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateEntityProps, DateVO, Entity, ID } from '@appvise/domain';
import { EntityBaseStampedSchema } from './entity-base-stamped.schema';

export type EntityStampedSchemaProps<TEntitySchema> = Omit<
  TEntitySchema,
  'id' | 'created_at' | 'updated_at'
>;

export interface EntityStampedProps<TEntityProps> {
  id: ID;
  props: TEntityProps;
}

export abstract class EntityStampedSchemaFactory<
  TEntity extends Entity<unknown>,
  TEntitySchema extends EntityBaseStampedSchema
> {
  constructor(
    protected entityConstructor: new (props: CreateEntityProps<any>) => TEntity,
    protected entitySchemaConstructor: new (
      props: EntityStampedSchemaProps<TEntitySchema>
    ) => TEntitySchema
  ) {}

  protected abstract toDomainProps(
    entitySchema: TEntitySchema
  ): EntityStampedProps<unknown>;

  protected abstract toSchemaProps(
    entity: TEntity
  ): EntityStampedSchemaProps<TEntitySchema>;

  toDomain(entitySchema: TEntitySchema): TEntity {
    const { id, props } = this.toDomainProps(entitySchema);
    const entitySchemaBase: EntityBaseStampedSchema =
      entitySchema as unknown as EntityBaseStampedSchema;
    return new this.entityConstructor({
      id,
      props,
      createdAt: new DateVO(entitySchemaBase.created_at),
      updatedAt: new DateVO(entitySchemaBase.updated_at),
    });
  }

  toSchema(entity: TEntity): TEntitySchema {
    const props = this.toSchemaProps(entity);
    return new this.entitySchemaConstructor({
      ...props,
      id: entity.id.value,
      created_at: entity.createdAt.value,
      updated_at: entity.updatedAt.value,
    });
  }
}
