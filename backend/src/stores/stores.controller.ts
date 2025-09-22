import { Body, Controller, Get, Post, Delete, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { stores, addStore, deleteStore } from './stores.data';
import { AdminGuard } from '../auth/admin.guard';

@Controller('stores')
export class StoresController {
  @Get()
  findAll() {
    return stores;
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: { code?: string | number; name?: string }) {
    const code = body?.code;
    const name = body?.name;
    if (code === undefined || name === undefined) {
      throw new BadRequestException('code and name are required');
    }
    try {
      return addStore(String(code), String(name));
    } catch (e: any) {
      throw new BadRequestException(e.message || 'Failed to add store');
    }
  }

  @Delete(':code')
  @UseGuards(AdminGuard)
  remove(@Param('code') code: string) {
    try {
      return deleteStore(code);
    } catch (e: any) {
      throw new BadRequestException(e.message || 'Failed to delete store');
    }
  }
}
