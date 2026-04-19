import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MetricsInterceptor } from './metrics.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new MetricsInterceptor());
  app.enableCors({
    origin: ['http://13.60.183.180', 'http://localhost:5173', 'http://localhost'], // frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // for cookies
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
