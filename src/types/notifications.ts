export type NotificationType =
  // Claims
  | 'claim_created'
  | 'claim_assigned'
  | 'claim_updated'
  | 'claim_status_changed'
  | 'claim_resolved'
  | 'claim_closed'
  | 'claim_comment_added'
  | 'claim_mention'
  | 'claim_sla_breach'
  | 'claim_sla_warning'      // 80% du SLA écoulé
  // Assets / CAFM
  | 'asset_assigned'
  | 'asset_health_critical'
  | 'asset_predicted_failure'
  | 'maintenance_due'
  | 'maintenance_overdue'
  // Environments
  | 'environment_status_changed'
  // System
  | 'user_invited'
  | 'user_role_changed'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'subscription_activated'
  // IoT
  | 'iot_alert'
  | 'iot_anomaly_detected';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms' | 'webhook';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BizOSNotification {
  id: string;
  organizationId: string;
  userId: string;
  
  type: NotificationType;
  priority: NotificationPriority;
  
  title: string;
  message: string;
  
  // Routing
  resourceType?: string;        // 'claim' | 'asset' | 'environment'
  resourceId?: string;
  actionUrl?: string;           // '/claims/{id}'
  
  // Payload
  data: Record<string, any>;
  
  // Channels delivered
  channels: NotificationChannel[];
  
  // Status
  isRead: boolean;
  readAt?: number;
  isArchived: boolean;
  archivedAt?: number;
  
  // Action tracking
  clickedAt?: number;
  dismissedAt?: number;
  
  createdAt: number;
  expiresAt?: number;
  
  // Grouping (e.g., 5 claims assigned → single notification)
  groupKey?: string;
  count?: number;               // For grouped notifications
}
