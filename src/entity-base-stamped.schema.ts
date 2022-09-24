import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EntityBaseSchema } from './entity-base.schema';

export class EntityBaseStampedSchema extends EntityBaseSchema {
  constructor(props?: Record<string, unknown>) {
    super(props);

    if (props?.created_at && props.created_at instanceof Date) {
      this.created_at = props.created_at;
    }

    if (props?.updated_at && props.updated_at instanceof Date) {
      this.updated_at = props.updated_at;
    }
  }

  @CreateDateColumn({ type: 'timestamp', update: false })
  readonly created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  readonly updated_at!: Date;
}
