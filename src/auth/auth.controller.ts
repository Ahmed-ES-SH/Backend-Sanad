import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import type { Request, Response } from 'express';
import { GetUser } from './decorators/current-user.decorator';
import { User } from '../user/schema/user.schema';

/**
 * Controller responsible for handling authentication-related requests.
 * Includes Login, Email Verification, Password Reset, and Google OAuth-.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Logs out the current user by adding their token to the blacklist
   * and clearing the auth cookie.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @GetUser() user: User,
  ) {
    const token = req.cookies?.['sanad_auth_token'];

    if (token) {
      await this.authService.logout(token, user.id.toString());
    }

    res.clearCookie('sanad_auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({ message: 'User logged out successfully' });
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * @param req - The request object containing the user attached by JwtAuthGuard.
   */
  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  getProfile(@Req() req: Request & { user: User }) {
    return req.user;
  }
}
