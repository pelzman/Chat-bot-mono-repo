import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const PORT = process.env.PORT || 3000
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist:true,
     forbidNonWhitelisted:false, 
     transform:true
    }))
  app.use(cookieParser());
  const allowedOrigins = ['http://localhost:5173'];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  app.enableCors({ origin: allowedOrigins, credentials: true });
  await app.listen(PORT);
  console.log("App is running on port : " + PORT)
}
bootstrap();
