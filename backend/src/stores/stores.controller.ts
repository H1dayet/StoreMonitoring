import { Controller, Get } from '@nestjs/common';
import { stores } from './stores.data';

@Controller('stores')
export class StoresController {
  @Get()
  findAll() {
    return stores;
  }
}
