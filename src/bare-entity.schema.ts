import { PrimaryColumn } from 'typeorm';

export abstract class BareEntitySchema {
  constructor(props?: unknown) {
    if (props) {
      Object.assign(this, props);
    }
  }

  @PrimaryColumn({ update: false })
  readonly id!: string;
}
