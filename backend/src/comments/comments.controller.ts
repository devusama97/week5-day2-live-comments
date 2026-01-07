import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { LikesService } from '../likes/likes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private likesService: LikesService,
    private notificationsService: NotificationsService,
    private websocketGateway: WebSocketGatewayService,
  ) {}

  @Post()
  async createComment(@CurrentUser() user: any, @Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.createComment(user.userId, createCommentDto);
    
    console.log('Emitting new_comment event:', comment._id);
    // Emit new comment to all users for real-time updates
    this.websocketGateway.emitToAll('new_comment', comment);
    
    return comment;
  }

  @Post('reply')
  async replyToComment(@CurrentUser() user: any, @Body() replyCommentDto: ReplyCommentDto) {
    const reply = await this.commentsService.replyToComment(user.userId, replyCommentDto);
    
    // Get parent comment to find the author
    const parentComment = await this.commentsService.getCommentById(replyCommentDto.parentCommentId);
    
    // Emit reply to all users for real-time updates
    this.websocketGateway.emitToAll('new_reply', { reply, parentCommentId: replyCommentDto.parentCommentId });
    
    // Create and send notification to parent comment author
    if (parentComment.author._id.toString() !== user.userId) {
      const notification = await this.notificationsService.createNotification(
        parentComment.author._id.toString(),
        user.userId,
        NotificationType.REPLY,
        `${user.username} replied to your comment`,
        reply?._id.toString(),
        'Comment',
      );

      if (notification) {
        this.websocketGateway.emitToUser(parentComment.author._id.toString(), 'notification', notification);
      }
    }
    
    return reply;
  }

  @Get()
  async getAllComments() {
    return this.commentsService.getAllComments();
  }

  @Get(':id')
  async getComment(@Param('id') commentId: string) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post(':id/like')
  async likeComment(@CurrentUser() user: any, @Param('id') commentId: string) {
    const result = await this.likesService.likeComment(user.userId, commentId);
    
    console.log('Emitting like_update event:', commentId, result.liked);
    // Emit like update to all users for real-time updates
    this.websocketGateway.emitToAll('like_update', { commentId, liked: result.liked, userId: user.userId });
    
    // If comment was liked (not unliked), send notification
    if (result.liked) {
      const comment = await this.commentsService.getCommentById(commentId);
      
      if (comment.author._id.toString() !== user.userId) {
        const notification = await this.notificationsService.createNotification(
          comment.author._id.toString(),
          user.userId,
          NotificationType.LIKE,
          `${user.username} liked your comment`,
          commentId,
          'Comment',
        );

        if (notification) {
          console.log('Emitting notification to user:', comment.author._id.toString());
          this.websocketGateway.emitToUser(comment.author._id.toString(), 'notification', notification);
        }
      }
    }
    
    return result;
  }

  @Get(':id/likes')
  async getCommentLikes(@Param('id') commentId: string) {
    return this.likesService.getCommentLikes(commentId);
  }

  @Patch(':id')
  async updateComment(@CurrentUser() user: any, @Param('id') commentId: string, @Body() updateData: { content: string }) {
    const updatedComment = await this.commentsService.updateComment(user.userId, commentId, updateData.content);
    
    // Emit update to all users for real-time updates
    this.websocketGateway.emitToAll('comment_updated', { commentId, content: updateData.content });
    
    return updatedComment;
  }

  @Delete(':id')
  async deleteComment(@CurrentUser() user: any, @Param('id') commentId: string) {
    const result = await this.commentsService.deleteComment(user.userId, commentId);
    
    // Emit delete to all users for real-time updates
    this.websocketGateway.emitToAll('comment_deleted', { commentId });
    
    return result;
  }
}