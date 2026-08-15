import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { AppUser } from './authService';

export interface TicketNotificationPayload {
  ticketId: string;
  eventId: string;
  userEmail: string;
  userName: string;
  eventTitle: string;
  venueName: string;
  date: string;
  seatInfo: string;
}

/**
 * Envoie l'email contenant le billet final (PDF ou lien QR)
 */
export const sendTicketEmail = async (payload: TicketNotificationPayload): Promise<boolean> => {
  try {
    const sendEmailFn = httpsCallable(functions, 'sendTicketEmail');
    await sendEmailFn(payload);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de billet:', error);
    return false;
  }
};

/**
 * Envoie un SMS de rappel (si l'utilisateur a opt-in)
 */
export const sendEventReminderSMS = async (
  user: AppUser,
  eventTitle: string,
  timeUntil: string
): Promise<boolean> => {
  if (!user.preferences?.notifications?.sms) {
    return false;
  }

  try {
    const sendSmsFn = httpsCallable(functions, 'sendSMS');
    await sendSmsFn({
      userId: user.uid,
      message: `Rappel BizOS : L'événement "${eventTitle}" commence dans ${timeUntil}. N'oubliez pas votre billet !`
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS de rappel:', error);
    return false;
  }
};

/**
 * Logue une notification in-app dans Firestore
 */
export const logInAppNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> => {
  try {
    const createNotifFn = httpsCallable(functions, 'createInAppNotification');
    await createNotifFn({
      userId,
      type,
      title,
      message,
      actionUrl,
      priority: 'high'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification in-app:', error);
  }
};
