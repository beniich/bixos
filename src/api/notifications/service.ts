import { NotificationType, NotificationChannel, NotificationPriority } from '../../types/notifications';

export interface CreateNotificationParams {
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  resourceType?: string;
  resourceId?: string;
  actionUrl?: string;
  data?: Record<string, any>;
  groupKey?: string;
  channels?: NotificationChannel[];
  expiresAt?: Date;
}

export class NotificationService {
  async notify(params: CreateNotificationParams, prisma: any): Promise<string | null> {
    try {
      // 1. Dédoublonnage via groupKey
      if (params.groupKey) {
        const existing = await prisma.notification.findFirst({
          where: {
            organizationId: params.organizationId,
            userId: params.userId,
            groupKey: params.groupKey,
            isRead: false,
          },
        });
        
        if (existing) {
          const updated = await prisma.notification.update({
            where: { id: existing.id },
            data: {
              count: { increment: 1 },
              message: `${params.message} (+ autres similaires)`,
            },
          });
          return updated.id;
        }
      }

      // 2. Création de la notification in-app
      const channels = params.channels ?? ['in_app'];
      const now = new Date();
      
      const notif = await prisma.notification.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          type: params.type,
          priority: params.priority ?? 'medium',
          title: params.title,
          message: params.message,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          actionUrl: params.actionUrl,
          data: params.data ? JSON.stringify(params.data) : null,
          channels: JSON.stringify(channels),
          isRead: false,
          isArchived: false,
          groupKey: params.groupKey,
          count: 1,
          expiresAt: params.expiresAt 
            ? params.expiresAt
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      // 3. Mise à jour du compteur non lu (dénormalisé)
      await prisma.user.update({
        where: { id: params.userId },
        data: { unreadNotificationsCount: { increment: 1 } },
      });

      // Note: L'envoi Email/Push/SMS se ferait ici de manière asynchrone

      return notif.id;
    } catch (err) {
      console.error('[NOTIF] Failed to create', err);
      return null;
    }
  }

  async markAsRead(orgId: string, userId: string, notifId: string, prisma: any): Promise<void> {
    const notif = await prisma.notification.findUnique({ where: { id: notifId } });
    
    if (notif && !notif.isRead && notif.userId === userId && notif.organizationId === orgId) {
      await prisma.notification.update({
        where: { id: notifId },
        data: {
          isRead: true,
          readAt: new Date(),
        }
      });
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          unreadNotificationsCount: { decrement: 1 }
        }
      });
    }
  }

  async markAllAsRead(orgId: string, userId: string, prisma: any): Promise<void> {
    const unreadCount = await prisma.notification.count({
      where: {
        organizationId: orgId,
        userId: userId,
        isRead: false,
      }
    });

    if (unreadCount === 0) return;

    await prisma.notification.updateMany({
      where: {
        organizationId: orgId,
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      }
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: { unreadNotificationsCount: 0 }
    });
  }
}

export const notificationService = new NotificationService();
