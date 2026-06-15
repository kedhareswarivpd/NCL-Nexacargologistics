/**
 * Notification service — SMS & Email
 * Inserts notification records into Supabase `notifications` table.
 * In production, a Supabase Edge Function or pg_cron job sends actual SMS/email.
 */

import { supabase } from "./supabase";

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

export async function sendNotification(payload: NotificationPayload) {
  const records: object[] = [];

  if (payload.type === "email" || payload.type === "both") {
    records.push({
      channel: "email",
      recipient_name: payload.recipient_name,
      recipient_contact: payload.recipient_email ?? "",
      subject: payload.subject,
      message: payload.message,
      status: "queued",
      related_id: payload.related_id ?? null,
      related_type: payload.related_type ?? null,
    });
  }

  if (payload.type === "sms" || payload.type === "both") {
    records.push({
      channel: "sms",
      recipient_name: payload.recipient_name,
      recipient_contact: payload.recipient_phone ?? "",
      subject: payload.subject,
      message: payload.message,
      status: "queued",
      related_id: payload.related_id ?? null,
      related_type: payload.related_type ?? null,
    });
  }

  const { error } = await supabase.from("notifications").insert(records);
  if (error) console.error("[notification] insert error:", error.message);
  return !error;
}

export async function sendShipmentStatusUpdate(params: {
  tracking_id: string;
  status: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  eta?: string;
}) {
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
