import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const port = process.env.PORT || 3000; // Use environment variable or default to 3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Passkey Demo API')
    .setDescription('Demonstration project for Passkey authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // class transformer
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // Ensure this line is included to use class-transformer and class-validator

  await app.listen(port);
}
bootstrap().then(() => {
  console.log(`Application is running on http://localhost:${port}`);
});
