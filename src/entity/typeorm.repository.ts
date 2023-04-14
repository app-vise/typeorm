import { ObjectType, Repository as BaseRepository } from 'typeorm';
import {
  AggregateRoot,
  Entity,
  Logger,
  ReadRepository,
  Repository,
  SelectionSet,
  SearchRequest,
  SearchResponse,
  WriteRepository,
  CountRequest,
} from '@appvise/domain';
import {
  EntityBaseSchema,
  EntitySchemaFactory,
  TypeormReadRepository,
  TypeormWriteRepository,
} from '../index';

export class TypeormRepository<
  TEntity extends AggregateRoot<unknown> | Entity<unknown>,
  TEntitySchema extends EntityBaseSchema
> implements Repository<TEntity>
{
  private readonly readRepository: ReadRepository<TEntity>;
  private readonly writeRepository: WriteRepository<TEntity>;

  constructor(
    protected readonly entityModel: BaseRepository<TEntitySchema>,
    protected readonly entitySchemaFactory: EntitySchemaFactory<
      TEntity,
      TEntitySchema
    >,
    protected readonly entityType: ObjectType<TEntitySchema>,
    protected readonly logger: Logger,
    protected readonly asyncDomainEvents?: boolean
  ) {
    this.readRepository = new TypeormReadRepository(
      entityModel,
      entitySchemaFactory,
      entityType
    );

    this.writeRepository = new TypeormWriteRepository(
      entityModel,
      entitySchemaFactory,
      entityType,
      logger,
      asyncDomainEvents
    );
  }

  save(entity: TEntity): Promise<TEntity>;
  save(entity: TEntity, reload?: boolean): Promise<TEntity> {
    return this.writeRepository.save(entity, reload);
  }

  delete(entity: TEntity): Promise<void> {
    return this.writeRepository.delete(entity);
  }

  getCount(
    request: CountRequest,
    selectionSet?: SelectionSet
  ): Promise<number> {
    return this.readRepository.getCount(request, selectionSet);
  }

  find(
    request: SearchRequest,
    selectionSet?: SelectionSet
  ): Promise<SearchResponse<TEntity>> {
    return this.readRepository.find(request, selectionSet);
  }

  findOneById(
    id: string,
    selectionSet?: SelectionSet
  ): Promise<TEntity | undefined> {
    return this.readRepository.findOneById(id, selectionSet);
  }

  findOneByIdOrThrow(
    id: string,
    selectionSet?: SelectionSet
  ): Promise<TEntity> {
    return this.readRepository.findOneByIdOrThrow(id, selectionSet);
  }
}
