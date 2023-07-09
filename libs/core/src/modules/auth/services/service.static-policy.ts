import { ForbiddenException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import fs from "fs";
import { IAuthPolicyService, IRole, IStatement } from "../base/auth.policy.interface";

export interface IStaticPolicyAdapterOptions {
  // path of json role file. Default: config/roles.json
  rolesPath?: string;
  // path of json scope file. Defualt: config/scopes.json
  scopesPath?: string;
}

@Injectable()
export class StaticPolicyAdapter implements OnModuleInit, IAuthPolicyService {
  private logger = new Logger(StaticPolicyAdapter.name);
  private _roles: Record<string, IRole> = {};
  private _scopes: Record<string, IStatement[]> = {};
  private options: IStaticPolicyAdapterOptions;

  constructor() {
    this.options = {
      rolesPath: "config/roles.json",
      scopesPath: "config/scopes.json",
    };
  }

  async onModuleInit() {
    await this.loadRoles();
    await this.loadScopes();
  }

  private async loadRoles() {
    if (!this.options.rolesPath) {
      throw new ForbiddenException("path is not defined");
    }

    // check file exist
    if (!fs.existsSync(this.options.rolesPath)) {
      throw new ForbiddenException("roles file not found");
    }

    // read file
    const json = JSON.parse(fs.readFileSync(this.options.rolesPath, "utf8"));

    // reduce json to record of statements
    Object.keys(json).forEach((roleName) => {
      const role: IRole = {
        name: roleName,
        policy: [],
      };
      for (const policy of json[roleName]) {
        const effect = policy[0];
        const actions = typeof policy[1] === "string" ? policy[1].split(" ") : policy[1];
        const resources = typeof policy[2] === "string" ? policy[2].split(" ") : policy[2];

        role.policy.push({ effect, actions, resources });
      }

      this._roles[roleName] = role;
    });

    this.logger.log(`Loaded ${Object.keys(this._roles).length} roles`);
  }

  private async loadScopes() {
    if (!this.options.scopesPath) {
      throw new ForbiddenException("scopes path is not defined");
    }

    // check file exist
    if (!fs.existsSync(this.options.scopesPath)) {
      throw new ForbiddenException("scopes file not found");
    }

    // read file
    const json = JSON.parse(fs.readFileSync(this.options.scopesPath, "utf8"));

    // reduce json to record of statements
    Object.keys(json).forEach((scope) => {
      const policy: IStatement[] = [];
      for (const p of json[scope]) {
        const statement: IStatement = {
          effect: p[0],
          actions: typeof p[1] === "string" ? p[1].split(" ") : p[1],
          resources: typeof p[2] === "string" ? p[2].split(" ") : p[2],
        };
        // if 3 is exist, it can be fields or conditions
        if (p[3]) {
          // if 3 is string or array, it is fields
          if (typeof p[3] === "string" || Array.isArray(p[3])) {
            statement.fields = typeof p[3] === "string" ? p[3].split(" ") : p[3];
          } else {
            // if 3 is object, it is conditions
            statement.conditions = p[3];
          }
        }
        // if 4 is exist, it is conditions
        if (p[4]) {
          statement.conditions = p[4];
        }

        policy.push(statement);
      }

      this._scopes[scope] = policy;
    });

    this.logger.log(`Loaded ${Object.keys(this._scopes).length} scopes`);
  }

  async getPolicy(roleName: string): Promise<IStatement[]> {
    const role = this._roles[roleName];
    if (!role) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(role.policy);
    }
  }

  async getPolicyByScope(scopeName: string): Promise<IStatement[]> {
    const policy = this._scopes[scopeName];
    if (!policy) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(policy);
    }
  }
}
