import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ScrapperModule } from './scrapper/scrapper.module'
import { CommandFactory } from 'nest-commander'

async function bootstrap() {
  await CommandFactory.run(ScrapperModule)
}
bootstrap()
