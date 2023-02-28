import { FilterType } from '@appvise/domain';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { camelToSnakeCase } from '.';

export class QueryHelper {
  static addFilters<TEntitySchema>(
    filters: FilterType,
    builder: SelectQueryBuilder<TEntitySchema>
  ): Brackets {
    // Transform nested filters to use join aliases
    let key, filter;

    for ([key, filter] of Object.entries(filters)) {
      for (const [filterKey, filterEntry] of Object.entries(filter)) {
        if (typeof filterEntry === 'object') {
          // Add nested filters to root filter
          filters[`${key}.${filterKey}`] = filterEntry;

          // Delete original nested filter
          delete filters[key];
        }
      }
    }

    return new Brackets((qb) => {
      for (const [key, filter] of Object.entries(filters)) {
        if (key === 'AND' || key === 'OR') {
          // Root statement is always andWhere
          qb.andWhere(
            new Brackets((qbSub) => {
              // Loop through AND/OR filters array
              for (let i = 0; i < filter.length; i++) {
                // Recursively retrieve sub filters
                const expressions = QueryHelper.addFilters(filter[i], builder);

                // Add sub filters to brackets
                if (key === 'OR') {
                  qbSub.orWhere(expressions);
                } else {
                  qbSub.andWhere(expressions);
                }
              }
            })
          );
        } else {
          enum filterTypes {
            'equals' = '=',
            'contains' = 'LIKE',
            'iContains' = 'ILIKE',
            'excludes' = 'NOT LIKE',
            'lt' = '<',
            'lte' = '<=',
            'gt' = '>',
            'gte' = '>=',
          }

          for (const filterType in filterTypes) {
            let selectedFilterType: string | null = null;
            let filterValue = null;

            if (filter[filterType] != null) {
              selectedFilterType = filterType;
              filterValue = filter[filterType];
            }

            if (selectedFilterType != null && filterValue != null) {
              // Convert filter keys because field names are in snake case
              const snakeKey = camelToSnakeCase(key);

              // Parameter must be unique
              const paramName = `${snakeKey}_${Math.round(
                Math.random() * 100000000
              )}`;

              if (
                ['contains', 'iContains', 'excludes'].includes(
                  selectedFilterType
                )
              ) {
                filterValue = `%${filterValue}%`;
              }

              // TODO: Fix ts-error
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const operator = filterTypes[selectedFilterType];

              // Use JOIN alias for nested filters
              const fieldKey = snakeKey.includes('.')
                ? snakeKey // Use JOIN alias
                : `${builder.alias}.${snakeKey}`; // Use root alias;

              const where = `${fieldKey} ${operator} :${paramName}`;
              const parameters: ObjectLiteral = { [paramName]: filterValue };

              qb.andWhere(where, parameters);
            }
          }
        }
      }
    });
  }
}
