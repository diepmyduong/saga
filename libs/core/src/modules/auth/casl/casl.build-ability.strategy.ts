import { getRequest } from "@app/shared";
import { AbilityBuilder, AbilityClass, PureAbility, fieldPatternMatcher, mongoQueryMatcher } from "@casl/ability";
import { ExecutionContext, Logger } from "@nestjs/common";
import { AppAbility } from "./casl.app-ability";

export interface ICaslBuildAbilityStrategy {
  build(context: ExecutionContext): Promise<AppAbility>;
}

export abstract class CaslBuildAbilityStrategy implements ICaslBuildAbilityStrategy {
  protected readonly logger = new Logger(this.constructor.name);

  abstract configRule(builder: AbilityBuilder<AppAbility>, context: ExecutionContext): Promise<void>;

  abstract buildFromCache(context: ExecutionContext): Promise<AppAbility | undefined>;

  abstract setCache(ability: AppAbility, context: ExecutionContext): Promise<void>;

  async build(context: ExecutionContext): Promise<AppAbility> {
    // get ability from cache first
    const cached = await this.buildFromCache(context);

    if (cached) {
      return cached;
    }

    // build new ability and cache it
    const builder = this.createBuilder();
    await this.configRule(builder, context);
    const ability = builder.build({
      fieldMatcher: fieldPatternMatcher,
      conditionsMatcher: mongoQueryMatcher,
    });

    // cache ability
    await this.setCache(ability, context);

    return ability;
  }

  getRequest(context: ExecutionContext) {
    return getRequest(context);
  }

  createBuilder() {
    return new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);
  }
}
