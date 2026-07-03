import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();

let isAppInitialized = false;

async function initApp() {
  if (!isAppInitialized) {
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    await app.init();
    isAppInitialized = true;
  }
}

export default async (req, res) => {
  await initApp();
  expressApp(req, res);
};