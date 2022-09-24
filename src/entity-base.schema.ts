import { PrimaryColumn } from 'typeorm';

export abstract class EntityBaseSchema {
  protected constructor(props?: unknown) {
    if (props) {
      Object.assign(this, props);
    }
  }

  @PrimaryColumn({ update: false })
  readonly id!: string;
}
