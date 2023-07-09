import { NestFactory } from "@nestjs/core";
import { MigrationModule } from "./migration.module";

async function bootstrap() {
  await NestFactory.createApplicationContext(MigrationModule);
}
bootstrap();
