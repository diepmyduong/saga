export type JwtPayload = {
  userId: string; // user id
  username: string; // username
  role: string; // user role
  scopeHash?: string; // hash of scope
  version?: number; // token version
};

export type RefreshTokenPayload = {
  userId: string; // user id
  hash: string; // hash of random password
};
