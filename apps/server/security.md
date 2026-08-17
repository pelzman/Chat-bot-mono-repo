# Security Guide for NestJS ChatBot Application

Based on an analysis of your current solution (NestJS, Prisma, SQL Server, and Groq SDK), here is a tailored security guide focusing on critical areas you need to address before moving to production.

## 1. Implement Authentication & Authorization
Currently, your endpoints (like `POST /chat/sendMessage`) are completely open. Anyone can call them, potentially running up your Groq API bill.

> [!CAUTION]
> Unauthenticated endpoints connected to paid LLM APIs are a primary target for abuse.

**Actionable Steps:**
- **Add JWT Authentication:** Implement `@nestjs/jwt` and Passport to secure your routes.
- **Use Guards:** Protect your controllers using `@UseGuards()`.
  ```typescript
  import { UseGuards } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';

  @Controller('chat')
  @UseGuards(JwtAuthGuard)
  export class ChatController {
    // ...
  }
  ```
- **Bind User to Actions:** Instead of trusting the `userId` in the `CreateChatDto`, extract the authenticated user's ID from the JWT token (e.g., using a custom `@CurrentUser()` decorator).

## 2. API Rate Limiting (Crucial for AI Apps)
LLM requests are expensive and time-consuming. You must prevent malicious users or bots from spamming your `/chat/sendMessage` endpoint.

**Actionable Steps:**
- Install `@nestjs/throttler`.
- Configure throttler in your `AppModule`:
  ```typescript
  import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
  import { APP_GUARD } from '@nestjs/core';

  @Module({
    imports: [
      ThrottlerModule.forRoot([{
        ttl: 60000, // 1 minute
        limit: 10,  // 10 requests per minute
      }]),
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
    ],
  })
  export class AppModule {}
  ```

## 3. Global Validation & Sanitization
You have `class-validator` installed, but the global validation pipe isn't enabled in `main.ts`. This means invalid or malicious payloads could reach your services.

**Actionable Steps:**
- Enable the global validation pipe in `src/main.ts`:
  ```typescript
  import { ValidationPipe } from '@nestjs/common';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Strips properties without decorators
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to match DTO classes
    }));

    // ...
  }
  ```

## 4. App Hardening (Helmet & CORS)
Your `main.ts` is currently missing essential HTTP header protections and Cross-Origin Resource Sharing (CORS) configuration.

**Actionable Steps:**
- Enable CORS so only authorized domains can call your API:
  ```typescript
  app.enableCors({
    origin: 'https://your-frontend-domain.com', // Avoid using '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  ```
- Install and configure `helmet` to set secure HTTP headers:
  ```bash
  npm install helmet
  ```
  ```typescript
  import helmet from 'helmet';
  app.use(helmet());
  ```

## 5. LLM-Specific Security (Prompt Injection)
Since you are using Groq SDK to process user messages, you are vulnerable to Prompt Injection, where users try to override your system prompts.

> [!WARNING]
> Never trust user input passed to the LLM.

**Actionable Steps:**
- **System Prompts:** Clearly define strong System Instructions that tell the model to ignore malicious overrides.
- **Input Filtering:** Filter messages for common jailbreak terms or unusually large inputs before sending them to Groq.
- **Max Tokens Limit:** Set a strict limit on input message length to avoid Denial of Wallet (DoW) attacks.

## 6. Database Security (Prisma & SQL Server)
Your Prisma schema maps `userId` directly from User to Conversation. 

**Actionable Steps:**
- **Row-Level Security:** Ensure queries in `ChatService` always filter by the logged-in user's ID. Never allow a user to fetch or modify a `Conversation` that does not belong to them.
- **Environment Variables:** Ensure your `DATABASE_URL` and `GROQ_API_KEY` in your `.env` file are never committed to version control. Confirm `.env` is in your `.gitignore`.

## Summary Checklist
- [ ] Implement JWT Authentication
- [ ] Add Throttler Guard (Rate Limiting)
- [ ] Enable Global `ValidationPipe` in `main.ts`
- [ ] Enable CORS and add `helmet` in `main.ts`
- [ ] Implement input size limits and prompt injection mitigations
- [ ] Ensure database queries are scoped to the authenticated user
