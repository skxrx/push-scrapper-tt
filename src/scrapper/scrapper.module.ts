import { Module } from '@nestjs/common'
import { Scrapper } from './scrapper'

@Module({
  providers: [Scrapper],
})
export class ScrapperModule {}
