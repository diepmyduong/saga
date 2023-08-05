export interface IStatement {
  actions: string[];
  resources: string[];
  effect: "allow" | "deny";
  fields?: string[];
  conditions?: any;
}

export interface IRole {
  name: string;
  description?: string;
  policy: IStatement[];
}

export interface IAuthPolicyService {
  getPolicy(role: string): Promise<IStatement[]>;
  getPolicyByScope(scope: string): Promise<IStatement[]>;
}
