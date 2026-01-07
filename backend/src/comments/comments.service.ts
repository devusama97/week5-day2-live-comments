import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    const comment = new this.commentModel({
      ...createCommentDto,
      author: userId,
    });

    await comment.save();
    const populatedComment = await this.commentModel
      .findById(comment._id)
      .populate('author', 'username profilePicture')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username profilePicture' },
      });

    if (!populatedComment) {
      throw new NotFoundException('Comment not found after creation');
    }

    return {
      ...populatedComment.toObject(),
      likesCount: populatedComment.likes?.length || 0,
      replies: populatedComment.replies?.map((reply: any) => ({
        ...reply.toObject(),
        likesCount: reply.likes?.length || 0
      })) || []
    };
  }

  async replyToComment(userId: string, replyCommentDto: ReplyCommentDto) {
    const parentComment = await this.commentModel.findById(replyCommentDto.parentCommentId);
    if (!parentComment) {
      throw new NotFoundException('Parent comment not found');
    }

    const reply = new this.commentModel({
      content: replyCommentDto.content,
      author: userId,
      parentComment: replyCommentDto.parentCommentId,
    });

    await reply.save();

    await this.commentModel.findByIdAndUpdate(replyCommentDto.parentCommentId, {
      $push: { replies: reply._id },
    });

    const populatedReply = await this.commentModel
      .findById(reply._id)
      .populate('author', 'username profilePicture');

    if (!populatedReply) {
      throw new NotFoundException('Reply not found after creation');
    }

    return {
      ...populatedReply.toObject(),
      likesCount: populatedReply.likes?.length || 0
    };
  }

  async getAllComments() {
    const comments = await this.commentModel
      .find({ parentComment: null })
      .populate('author', 'username profilePicture')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username profilePicture' },
      })
      .sort({ createdAt: -1 });

    return comments.map(comment => ({
      ...comment.toObject(),
      likesCount: comment.likes?.length || 0,
      replies: comment.replies?.map((reply: any) => ({
        ...reply.toObject(),
        likesCount: reply.likes?.length || 0
      })) || []
    }));
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentModel
      .findById(commentId)
      .populate('author', 'username profilePicture')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username profilePicture' },
      });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      ...comment.toObject(),
      likesCount: comment.likes?.length || 0,
      replies: comment.replies?.map((reply: any) => ({
        ...reply.toObject(),
        likesCount: reply.likes?.length || 0
      })) || []
    };
  }

  async updateComment(userId: string, commentId: string, content: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(commentId, { content }, { new: true })
      .populate('author', 'username profilePicture');

    if (!updatedComment) {
      throw new NotFoundException('Comment not found after update');
    }

    return {
      ...updatedComment.toObject(),
      likesCount: updatedComment.likes?.length || 0
    };
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    await this.commentModel.findByIdAndDelete(commentId);
    return { message: 'Comment deleted successfully' };
  }
}