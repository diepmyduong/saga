import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    },
  );

  await app.listen().then(() => {
    Logger.log('Worker Microservice is listening on port 3001', 'Bootstrap');
  });
}
bootstrap();
