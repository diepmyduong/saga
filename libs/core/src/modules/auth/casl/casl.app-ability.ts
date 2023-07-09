import {
  InferSubjects,
  PureAbility,
  AbilityTuple,
  Subject,
} from '@casl/ability';

type PossibleSubjects = InferSubjects<string | Subject | 'all'>;
type PosibleActions =
  | 'create'
  | 'findOne'
  | 'findAll'
  | 'remove'
  | 'update'
  | 'manage'
  | string;

export type AppAbility = PureAbility<
  AbilityTuple<PosibleActions, PossibleSubjects>
>;
