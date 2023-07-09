/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { ValidationError, validateSync } from "class-validator";
import _ from "lodash";

export abstract class BaseCommand {
  static create<T extends BaseCommand>(this: new (...args: any[]) => T, data: T): T {
    const convertedObject = plainToInstance<T, any>(this, JSON.parse(JSON.stringify(data)));

    const errors = validateSync(convertedObject as unknown as object);
    if (errors?.length) {
      const mappedErrors = _.flatten(errors.map((error) => getValidationErrorConstraints(error)));
      throw new BadRequestException(mappedErrors[0]);
    }

    return convertedObject;
  }
}

function getValidationErrorConstraints(error: ValidationError): string[] {
  if (error.constraints) {
    return Object.values(error.constraints);
  }
  if (error.children) {
    return _.flatten(error.children.map((item) => getValidationErrorConstraints(item)));
  }
  return [];
}
