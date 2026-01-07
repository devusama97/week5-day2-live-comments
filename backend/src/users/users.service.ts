import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Comment } from '../comments/schemas/comment.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('followers', 'username')
      .populate('following', 'username');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count user's comments (including replies)
    const commentsCount = await this.commentModel.countDocuments({ author: userId });
    console.log(`Comments count for user ${userId}:`, commentsCount);

    return {
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      commentsCount,
    };
  }

  async getProfileByUsername(username: string) {
    const user = await this.userModel
      .findOne({ username })
      .select('-password')
      .populate('followers', 'username')
      .populate('following', 'username');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count user's comments (including replies)
    const commentsCount = await this.commentModel.countDocuments({ author: user._id });
    console.log(`Comments count for user ${username}:`, commentsCount);

    return {
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      commentsCount,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { following: targetUserId },
    });

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: userId },
    });

    return { message: 'User followed successfully' };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { following: targetUserId },
    });

    await this.userModel.findByIdAndUpdate(targetUserId, {
      $pull: { followers: userId },
    });

    return { message: 'User unfollowed successfully' };
  }

  async findById(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }
}