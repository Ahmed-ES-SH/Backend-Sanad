import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { Roles } from '../auth/decorators/Roles.decorator';
import { UserRoleEnum } from '../auth/types/UserRoleEnum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { FilterOptionsDto } from './dto/filter-options.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user (Registration)
   * @param createUserDto
   * @returns {Promise<User>}
   */
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * Get all users
   * @returns {Promise<User[]>}
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  findAll(
    @Query() query: FilterOptionsDto,
    @GetUser('id') currentUserId: number,
  ): Promise<PaginatedResult<User>> {
    return this.userService.findAll(query, query, currentUserId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('ids')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  findAllIds(): Promise<number[]> {
    return this.userService.findAllIds();
  }

  /**
   * Get users stats
   * @returns {Promise<any>}
   */
  @Get('stats')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  stats() {
    return this.userService.stats();
  }

  /**
   * Get user by id
   * @param id
   * @returns {Promise<User | null>}
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(+id);
  }

  /**
   * Update user
   * @param id
   * @param updateUserDto
   * @returns {Promise<User>}
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * Delete user
   * @param id
   * @returns {Promise<User>}
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<User> {
    return this.userService.remove(+id);
  }
}
