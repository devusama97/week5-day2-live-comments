import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async createNotification(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    entityId?: string,
    entityType?: string,
  ) {
    if (recipientId === senderId) return null;

    const notification = new this.notificationModel({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      entityId,
      entityType,
    });

    await notification.save();
    return this.notificationModel
      .findById(notification._id)
      .populate('sender', 'username profilePicture');
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ recipient: userId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { recipient: userId, read: false },
      { read: true },
    );
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({
      recipient: userId,
      read: false,
    });
  }
}