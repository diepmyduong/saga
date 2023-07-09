import { Logger } from "@nestjs/common";

export abstract class BaseUsecase {
  protected logger = new Logger(this.constructor.name);

  abstract execute(...args: any[]): Promise<any>;
}
