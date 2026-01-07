import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SocketUserMap } from '../utils/socket-user-map';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      SocketUserMap.addUser(userId, client.id);
      client.join(`user_${userId}`);
      
      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = SocketUserMap.getUserId(client.id);
    if (userId) {
      SocketUserMap.removeUser(client.id);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
  }

  // Emit notification to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  // Emit to all connected users
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Emit new comment to all users
  emitNewComment(comment: any) {
    this.server.emit('new_comment', comment);
  }

  // Emit new reply to comment author
  emitNewReply(authorId: string, reply: any) {
    this.emitToUser(authorId, 'new_reply', reply);
  }

  // Emit like notification to comment author
  emitLikeNotification(authorId: string, notification: any) {
    this.emitToUser(authorId, 'like_notification', notification);
  }

  // Emit follow notification
  emitFollowNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'follow_notification', notification);
  }
}