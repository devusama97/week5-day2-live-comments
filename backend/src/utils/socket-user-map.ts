export class SocketUserMap {
  private static userSocketMap = new Map<string, string>();
  private static socketUserMap = new Map<string, string>();

  static addUser(userId: string, socketId: string) {
    this.userSocketMap.set(userId, socketId);
    this.socketUserMap.set(socketId, userId);
  }

  static removeUser(socketId: string) {
    const userId = this.socketUserMap.get(socketId);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(socketId);
    }
  }

  static getSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  static getUserId(socketId: string): string | undefined {
    return this.socketUserMap.get(socketId);
  }
}