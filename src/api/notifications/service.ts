import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../firebase/firebaseAdmin';
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
  async notify(params: CreateNotificationParams): Promise<string | null> {
    try {
      // 1. Dédoublonnage via groupKey
      if (params.groupKey) {
        const existingQuery = await adminDb
          .collection('organizations')
          .doc(params.organizationId)
          .collection('users')
          .doc(params.userId)
          .collection('notifications')
          .where('groupKey', '==', params.groupKey)
          .where('isRead', '==', false)
          .limit(1)
          .get();
        
        if (!existingQuery.empty) {
          const existing = existingQuery.docs[0];
          await existing.ref.update({
            count: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
            message: `${params.message} (+ autres similaires)`,
          });
          return existing.id;
        }
      }

      // 2. Création de la notification in-app
      const channels = params.channels ?? ['in_app'];
      const now = Date.now();
      
      const notifRef = await adminDb
        .collection('organizations')
        .doc(params.organizationId)
        .collection('users')
        .doc(params.userId)
        .collection('notifications')
        .add({
          organizationId: params.organizationId,
          userId: params.userId,
          type: params.type,
          priority: params.priority ?? 'medium',
          title: params.title,
          message: params.message,
          resourceType: params.resourceType ?? null,
          resourceId: params.resourceId ?? null,
          actionUrl: params.actionUrl ?? null,
          data: params.data ?? {},
          channels,
          isRead: false,
          isArchived: false,
          groupKey: params.groupKey ?? null,
          count: 1,
          createdAt: now,
          expiresAt: params.expiresAt 
            ? params.expiresAt.getTime()
            : now + 30 * 24 * 60 * 60 * 1000,
        });

      // 3. Mise à jour du compteur non lu (dénormalisé)
      await adminDb
        .collection('organizations')
        .doc(params.organizationId)
        .collection('users')
        .doc(params.userId)
        .set({
          unreadNotificationsCount: FieldValue.increment(1),
        }, { merge: true });

      // Note: L'envoi Email/Push/SMS se ferait ici de manière asynchrone

      return notifRef.id;
    } catch (err) {
      console.error('[NOTIF] Failed to create', err);
      return null;
    }
  }

  async markAsRead(orgId: string, userId: string, notifId: string): Promise<void> {
    await adminDb
      .collection('organizations')
      .doc(orgId)
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notifId)
      .update({
        isRead: true,
        readAt: Date.now(),
      });
    
    await adminDb
      .collection('organizations')
      .doc(orgId)
      .collection('users')
      .doc(userId)
      .set({
        unreadNotificationsCount: FieldValue.increment(-1),
      }, { merge: true });
  }

  async markAllAsRead(orgId: string, userId: string): Promise<void> {
    const unreadQuery = await adminDb
      .collection('organizations')
      .doc(orgId)
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('isRead', '==', false)
      .get();
    
    if (unreadQuery.empty) return;

    const batch = adminDb.batch();
    unreadQuery.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: Date.now(),
      });
    });
    
    batch.set(
      adminDb.collection('organizations').doc(orgId).collection('users').doc(userId),
      { unreadNotificationsCount: 0 },
      { merge: true }
    );

    await batch.commit();
  }
}

export const notificationService = new NotificationService();
