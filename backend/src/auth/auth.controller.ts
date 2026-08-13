import { Controller, Post, Res, Get, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('guest')
  async guestLogin(@Res({ passthrough: true }) response: any) {
    const result = await this.authService.createGuestSession();
    
    const isProd = process.env.NODE_ENV === 'production';
    response.cookie('jwt', result.token, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }
}
