import { Logger } from "@nestjs/common";

export interface IMigration {
  up(): Promise<void>;
}

export abstract class BaseMigration implements IMigration {
  protected logger = new Logger(this.constructor.name);

  abstract up(): Promise<void>;
}
