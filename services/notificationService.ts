import { Solicitud } from '../types';
import { addDays, isSameDay, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return 'denied';
  }
  const permission = await Notification.requestPermission();
  return permission;
};

export const sendNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    // We use a generic icon if available, or just standard notification
    new Notification(title, { 
      body, 
      icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png',
      lang: 'es'
    });
  }
};

const SENT_NOTIFICATIONS_KEY = 'sent_notifications_log';

export const checkAndNotifyUpcoming = (solicitudes: Solicitud[]) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Retrieve log of already sent notifications to avoid spamming on refresh
  const sentLog: string[] = JSON.parse(localStorage.getItem(SENT_NOTIFICATIONS_KEY) || '[]');
  let updatedLog = [...sentLog];
  let hasChanges = false;

  const today = new Date();
  const tomorrow = addDays(today, 1);
  // We use today's date as part of the ID so notifications can be sent again for the same event if needed in a different context, 
  // but here we just want to ensure we don't spam the *same* alert today.
  const todayStr = format(today, 'yyyy-MM-dd');

  solicitudes.forEach(s => {
    const start = parseISO(s.fechaInicio);
    const end = parseISO(s.fechaFin);

    // Unique ID for "Start Date Alert" sent "Today"
    const startNotifId = `${s.id}-start-${todayStr}`;
    // Unique ID for "End Date Alert" sent "Today"
    const endNotifId = `${s.id}-end-${todayStr}`;

    // 1. Check if Start Date is Tomorrow
    if (isSameDay(start, tomorrow)) {
       if (!sentLog.includes(startNotifId)) {
         sendNotification(
           `📅 Mañana inicia: ${s.tipoPeticion}`,
           `Hola ${s.nombre}, recordatorio: tu ${s.tipoPeticion} comienza mañana (${format(start, 'dd MMMM', { locale: es })}).`
         );
         updatedLog.push(startNotifId);
         hasChanges = true;
       }
    }

    // 2. Check if End Date is Tomorrow
    if (isSameDay(end, tomorrow)) {
       if (!sentLog.includes(endNotifId)) {
         sendNotification(
           `🏁 Mañana finaliza: ${s.tipoPeticion}`,
           `Hola ${s.nombre}, recordatorio: mañana es el último día de tu ${s.tipoPeticion}.`
         );
         updatedLog.push(endNotifId);
         hasChanges = true;
       }
    }
  });

  if (hasChanges) {
    localStorage.setItem(SENT_NOTIFICATIONS_KEY, JSON.stringify(updatedLog));
  }
};