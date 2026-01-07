import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../comments/schemas/comment.schema';

@Injectable()
export class LikesService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

  async likeComment(userId: string, commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isLiked = comment.likes.includes(userId as any);
    
    if (isLiked) {
      await this.commentModel.findByIdAndUpdate(commentId, {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      });
      return { liked: false, message: 'Comment unliked' };
    } else {
      await this.commentModel.findByIdAndUpdate(commentId, {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      });
      return { liked: true, message: 'Comment liked' };
    }
  }

  async getUserLikedComments(userId: string) {
    const likedComments = await this.commentModel
      .find({ likes: userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    return likedComments;
  }

  async getCommentLikes(commentId: string) {
    const comment = await this.commentModel
      .findById(commentId)
      .populate('likes', 'username profilePicture');
    
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      likes: comment.likes,
      likesCount: comment.likesCount,
    };
  }
}