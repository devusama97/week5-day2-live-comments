import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('followers')
@UseGuards(JwtAuthGuard)
export class FollowersController {
  constructor(private followersService: FollowersService) {}

  @Post('follow/:userId')
  async followUser(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.followersService.followUser(user.userId, userId);
  }

  @Delete('unfollow/:userId')
  async unfollowUser(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.followersService.unfollowUser(user.userId, userId);
  }

  @Get('is-following/:userId')
  async isFollowing(@CurrentUser() user: any, @Param('userId') userId: string) {
    const isFollowing = await this.followersService.isFollowing(user.userId, userId);
    return { isFollowing };
  }

  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return this.followersService.getFollowers(userId);
  }

  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return this.followersService.getFollowing(userId);
  }
}