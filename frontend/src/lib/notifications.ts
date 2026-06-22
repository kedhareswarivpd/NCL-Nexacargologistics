/**
 * Notification helper.
 *
 * Notifications are now owned by the FastAPI backend: it automatically queues
 * in-app + email notifications when a shipment status changes (see the
 * `/shipments/{id}/status` endpoint). These client helpers are kept for
 * backwards compatibility with callers, and POST to the backend notifications
 * endpoint as a best effort (admin-only; silently no-ops otherwise).
 */

import { notificationsApi } from "./services";

export type NotificationType = "sms" | "email" | "both";

export interface NotificationPayload {
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  subject: string;
  message: string;
  type: NotificationType;
  related_id?: string;   // shipment/delivery id
  related_type?: string; // "shipment" | "delivery"
}

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    await notificationsApi.send({
      channel: payload.type === "both" ? "email" : payload.type,
      title: payload.subject,
      message: payload.message,
      type: payload.related_type,
      related_id: payload.related_id ?? null,
      related_type: payload.related_type ?? null,
    });
    return true;
  } catch {
    // Non-admin callers can't broadcast; the backend handles real delivery
    // automatically on status changes, so this is a best-effort no-op.
    return false;
  }
}

export async function sendShipmentStatusUpdate(params: {
  tracking_id: string;
  status: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  eta?: string;
}): Promise<boolean> {
  const message = `NexaCargo: Your shipment ${params.tracking_id} is now "${params.status}".${params.eta ? ` ETA: ${params.eta}.` : ""} Track at nexacargo.com/track`;
  return sendNotification({
    recipient_name: params.customer_name,
    recipient_email: params.customer_email,
    recipient_phone: params.customer_phone,
    subject: `Shipment ${params.tracking_id} — Status Update: ${params.status}`,
    message,
    type: "both",
    related_id: params.tracking_id,
    related_type: "shipment",
  });
}
