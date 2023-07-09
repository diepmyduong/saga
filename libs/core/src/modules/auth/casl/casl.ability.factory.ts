import { ExecutionContext, Injectable, InternalServerErrorException, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { CaslBuildAbilityStrategy } from "./casl.build-ability.strategy";

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  createByStrategy<Strategy extends CaslBuildAbilityStrategy>(strategy: Type<Strategy>, context: ExecutionContext) {
    const strategyInstance = this.moduleRef.get(strategy);
    if (!(strategyInstance instanceof CaslBuildAbilityStrategy)) {
      throw new InternalServerErrorException(
        `Strategy ${strategy.name} is not an instance of CaslBuildAbilityStrategy`
      );
    }
    return strategyInstance.build(context);
  }
}
