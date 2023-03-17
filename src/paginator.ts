import {
  Brackets,
  ObjectType,
  OrderByCondition,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { SearchRequest, SearchResponse, SortDirection } from '@appvise/domain';
import { atob, btoa, decodeByType, encodeByType, EntityBaseSchema } from '.';

interface CursorParam {
  [key: string]: any;
}

export interface Cursor {
  beforeCursor: string | undefined;
  afterCursor: string | undefined;
}

export class Paginator<TEntitySchema extends EntityBaseSchema> {
  private endCursor: string | undefined = undefined;
  private startCursor: string | undefined = undefined;
  private readonly alias: string;
  private readonly direction: SortDirection = SortDirection.desc;

  public constructor(
    private entity: ObjectType<TEntitySchema>,
    private paginationKeys: Extract<keyof TEntitySchema, string>[],
    private request: SearchRequest
  ) {
    if (request.sort && request.sort.length > 0) {
      this.direction = request.sort[0].direction;
    }

    this.alias = entity.name;
  }

  public async paginate(
    builder: SelectQueryBuilder<TEntitySchema>,
    queryBuilderCallBack?: (
      queryBuilder: SelectQueryBuilder<TEntitySchema>
    ) => SelectQueryBuilder<TEntitySchema>
  ): Promise<SearchResponse<TEntitySchema>> {
    builder = this.appendPagingQuery(builder);

    const qb = queryBuilderCallBack ? queryBuilderCallBack(builder) : builder;
    const entities = await qb.getMany();
    const hasMore = entities.length > this.request.first;

    if (hasMore) {
      entities.splice(entities.length - 1, 1);
    }

    if (
      entities.length > 0 &&
      !this.hasAfterCursor() &&
      this.hasBeforeCursor()
    ) {
      entities.reverse();
    }

    if (entities.length > 0 && (this.hasBeforeCursor() || hasMore)) {
      this.endCursor = this.encode(entities[entities.length - 1]);
    }

    if (
      entities.length > 0 &&
      (this.hasAfterCursor() || (hasMore && this.hasBeforeCursor()))
    ) {
      this.startCursor = this.encode(entities[0]);
    }

    return {
      results: entities.map((entity) => {
        return {
          cursor: this.encode(entity),
          item: entity,
        };
      }),
      pageInfo: {
        hasPreviousPage: this.startCursor !== undefined,
        hasNextPage: this.endCursor !== undefined,
        startCursor: this.startCursor,
        endCursor: this.endCursor,
      },
    };
  }

  private appendPagingQuery(
    builder: SelectQueryBuilder<TEntitySchema>
  ): SelectQueryBuilder<TEntitySchema> {
    const cursors: CursorParam = {};

    if (this.request.after) {
      Object.assign(cursors, this.decode(this.request.after));
    } else if (this.request.before) {
      Object.assign(cursors, this.decode(this.request.before));
    }

    if (Object.keys(cursors).length > 0) {
      builder.andWhere(
        new Brackets((where) => this.buildCursorQuery(where, cursors))
      );
    }

    builder.take(this.request.first + 1);
    builder.orderBy(this.buildOrder());

    return builder;
  }

  private buildCursorQuery(
    where: WhereExpressionBuilder,
    cursors: CursorParam
  ): void {
    const operator = this.getOperator();
    const params: CursorParam = {};
    let query = '';

    this.paginationKeys.forEach((key) => {
      // Use JOIN alias for nested fields
      const fieldKey = key.includes('.')
        ? key // Use JOIN alias
        : `${this.alias}.${key}`; // Use root alias;

      params[key] = cursors[key];
      where.orWhere(`${query}${fieldKey} ${operator} :${key}`, params);
      query = `${query}${fieldKey} = :${key} AND `;
    });
  }

  private getOperator(): string {
    if (this.hasAfterCursor()) {
      return this.direction === SortDirection.asc ? '>' : '<';
    }

    if (this.hasBeforeCursor()) {
      return this.direction === SortDirection.asc ? '<' : '>';
    }

    return '=';
  }

  private buildOrder(): OrderByCondition {
    let { direction } = this;

    if (!this.hasAfterCursor() && this.hasBeforeCursor()) {
      direction = Paginator.flipDirection(direction);
    }

    const orderByCondition: OrderByCondition = {};

    this.paginationKeys.forEach((key) => {
      // Use JOIN alias for nested filters
      const fieldKey = key.includes('.')
        ? key // Use JOIN alias
        : `${this.alias}.${key}`; // Use root alias;

      orderByCondition[`${fieldKey}`] =
        direction === SortDirection.desc ? 'DESC' : 'ASC';
    });

    return orderByCondition;
  }

  private hasAfterCursor(): boolean {
    return this.request.after != null;
  }

  private hasBeforeCursor(): boolean {
    return this.request.before != null;
  }

  private encode(entity: TEntitySchema): string {
    const payload = this.paginationKeys
      .map((key) => {
        const subKeys: string[] = key.split('.');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let value = entity[subKeys[0]];

        if (subKeys.length === 2) {
          value = value[subKeys[1]];
        }

        const type = this.getEntityPropertyType(key);
        const encodedValue = encodeByType(type, value);

        return `${key}:${encodedValue}`;
      })
      .join(',');

    return btoa(payload);
  }

  private decode(cursor: string): CursorParam {
    const cursors: CursorParam = {};
    const columns = atob(cursor).split(',');
    columns.forEach((column) => {
      const [key, raw] = column.split(':');
      const type = this.getEntityPropertyType(key);

      cursors[key] = decodeByType(type, raw);
    });

    return cursors;
  }

  private getEntityPropertyType(key: string): string {
    const subKeys: string[] = key.split('.');

    let metadata = Reflect.getMetadata(
      'design:type',
      this.entity.prototype,
      subKeys[0]
    );

    // Get type from relation
    if (subKeys.length === 2) {
      metadata = Reflect.getMetadata(
        'design:type',
        metadata.prototype,
        subKeys[1]
      );
    }

    return metadata.name.toLowerCase();
  }

  private static flipDirection(direction: SortDirection): SortDirection {
    return direction === SortDirection.asc
      ? SortDirection.desc
      : SortDirection.asc;
  }
}
