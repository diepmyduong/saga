import { SetMetadata } from "@nestjs/common";

export const MIGRATION_META = "migration";

export interface IMigrationMeta {
  // if true, the migration will be executed & not saved to the database
  debug: boolean;
}

export const Migration = (meta: IMigrationMeta) => {
  return SetMetadata(MIGRATION_META, meta);
};
