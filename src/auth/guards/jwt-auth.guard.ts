import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that uses the JWT strategy to protect routes.
 * Automatically checks for the token in the Authorization header
 * or cookies and validates it using the JWT strategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
