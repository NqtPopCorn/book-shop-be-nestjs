import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, BooksModule] })
export class AppModule {}
