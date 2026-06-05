import { Controller } from '@nestjs/common';
import { HomeService } from './home.service';
import { Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('home')
@Public()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async getHomeData() {
    return this.homeService.getHomeData();
  }
}
