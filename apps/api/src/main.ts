import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('AssetsAlly API')
            .setDescription('Asset Verification System API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    // Global prefix
    app.setGlobalPrefix('api');

    // Root route (outside /api prefix)
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/', (req: any, res: any) => {
        res.json({
            name: 'AssetsAlly API',
            version: '0.0.1',
            status: 'running',
            docs: '/api/docs',
            health: '/api/health',
        });
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
