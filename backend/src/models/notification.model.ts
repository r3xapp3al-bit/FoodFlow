export interface Notification {
  id: string;
  user_id: string;
  channel: 'APP' | 'WHATSAPP' | 'EMAIL' | 'PUSH';
  type: string;
  title?: string;
  content: string;
  is_read: boolean;
  is_sent: boolean;
  created_at?: string;
}

export type NotificationCreate = Omit<Notification, 'id' | 'is_read' | 'is_sent' | 'created_at'>;
export type NotificationUpdate = Partial<Pick<Notification, 'is_read' | 'is_sent'>>;