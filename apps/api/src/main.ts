import { JWT_CONFIG, TIMEZONE } from "@app/shared";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { mkdirSync } from "fs";
import moment from "moment-timezone";

import { ApiModule } from "./api.module";
import { useHelmet } from "./plugins/use-helmet";

async function bootstrap() {
  // set moment locale
  moment.tz.setDefault(TIMEZONE);

  const app = await NestFactory.create(ApiModule);

  // set global prefix
  app.setGlobalPrefix("api");

  // init helmet
  useHelmet(app);
  // enable cors
  app.enableCors();
  // init cookie parser
  app.use(cookieParser(JWT_CONFIG.secret));
  // init folder
  initTempFolders();

  // enable shutdown hooks
  app.enableShutdownHooks();

  // handle unknow exception
  // app.useGlobalFilters(new UnknownExceptionFilter());

  await app.listen(5555, "0.0.0.0");
  Logger.log(`Application is running on ${await app.getUrl()}`, "Bootstrap");
}
bootstrap();

// init tmp folder before start
function initTempFolders() {
  const folders = ["tmp"];
  folders.forEach((folder) => {
    mkdirSync(folder, { recursive: true });
  });
}
