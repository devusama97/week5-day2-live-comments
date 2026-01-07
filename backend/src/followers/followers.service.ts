import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class FollowersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private notificationsService: NotificationsService,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  async followUser(userId: string, targetUserId: string) {
    console.log(`Follow request: ${userId} wants to follow ${targetUserId}`);
    
    if (userId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { following: targetUserId }
    });

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: userId }
    });

    // Get follower user info for notification
    const followerUser = await this.userModel.findById(userId).select('username');
    
    if (!followerUser) {
      throw new Error('Follower user not found');
    }
    
    console.log(`Creating follow notification from ${followerUser.username} to user ${targetUserId}`);
    
    // Create and send notification
    const notification = await this.notificationsService.createNotification(
      targetUserId,
      userId,
      NotificationType.FOLLOW,
      `${followerUser.username} started following you`,
      userId,
      'User',
    );

    console.log('Follow notification created:', notification);

    if (notification) {
      this.websocketGateway.emitFollowNotification(targetUserId, notification);
      console.log(`Follow notification emitted to user ${targetUserId}`);
    }

    return { message: 'User followed successfully' };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { following: targetUserId }
    });

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $pull: { followers: userId }
    });

    return { message: 'User unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('followers', 'username profilePicture bio');
    
    return user?.followers || [];
  }

  async getFollowing(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('following', 'username profilePicture bio');
    
    return user?.following || [];
  }

  async isFollowing(userId: string, targetUserId: string) {
    const user = await this.userModel.findById(userId);
    return user?.following.includes(targetUserId as any) || false;
  }
}