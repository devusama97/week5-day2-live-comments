import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FollowersService } from '../followers/followers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LikesService } from '../likes/likes.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private followersService: FollowersService,
    private notificationsService: NotificationsService,
    private likesService: LikesService,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  @Get('profile/:username')
  async getProfileByUsername(@Param('username') username: string) {
    return this.usersService.getProfileByUsername(username);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @Post('follow/:targetUserId')
  @UseGuards(JwtAuthGuard)
  async followUser(@CurrentUser() user: any, @Param('targetUserId') targetUserId: string) {
    const result = await this.usersService.followUser(user.userId, targetUserId);
    
    // Create and send notification
    const notification = await this.notificationsService.createNotification(
      targetUserId,
      user.userId,
      NotificationType.FOLLOW,
      `${user.username} started following you`,
      user.userId,
      'User',
    );

    if (notification) {
      this.websocketGateway.emitFollowNotification(targetUserId, notification);
    }

    return result;
  }

  @Post('unfollow/:targetUserId')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@CurrentUser() user: any, @Param('targetUserId') targetUserId: string) {
    return this.usersService.unfollowUser(user.userId, targetUserId);
  }

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  async getFollowers(@CurrentUser() user: any) {
    return this.followersService.getFollowers(user.userId);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  async getFollowing(@CurrentUser() user: any) {
    return this.followersService.getFollowing(user.userId);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @Post('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(@CurrentUser() user: any, @Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId, user.userId);
  }

  @Get('liked-comments')
  @UseGuards(JwtAuthGuard)
  async getLikedComments(@CurrentUser() user: any) {
    return this.likesService.getUserLikedComments(user.userId);
  }

  @Post('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }
}