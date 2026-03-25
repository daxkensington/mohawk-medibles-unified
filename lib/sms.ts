/**
 * SMS Library — Mohawk Medibles
 * Uses Amazon SNS for sending SMS notifications.
 * Gracefully degrades if AWS credentials are not configured.
 */
import { formatPhone } from "./phoneValidation";

// Lazy-load SNS client
let snsClient: any = null;

function getSNSClient() {
  if (snsClient) return snsClient;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    console.warn("[SMS] AWS credentials not configured — SMS will be skipped");
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SNSClient } = require("@aws-sdk/client-sns");
    snsClient = new SNSClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    return snsClient;
  } catch (err) {
    console.error("[SMS] Failed to initialize AWS SNS client:", err);
    return null;
  }
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single SMS message via Amazon SNS.
 */
export async function sendSMS(to: string, body: string): Promise<SmsResult> {
  const client = getSNSClient();

  if (!client) {
    console.warn("[SMS] AWS SNS not configured — skipping SMS to", to);
    return { success: false, error: "AWS SNS not configured" };
  }

  const formattedTo = formatPhone(to);
  if (!formattedTo) {
    return { success: false, error: "Invalid phone number" };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PublishCommand } = require("@aws-sdk/client-sns");
    const command = new PublishCommand({
      PhoneNumber: formattedTo,
      Message: body,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "Medibles",
        },
      },
    });

    const result = await client.send(command);
    return { success: true, messageId: result.MessageId };
  } catch (err: any) {
    console.error("[SMS] Send failed:", err?.message || err);
    return { success: false, error: err?.message || "SMS send failed" };
  }
}

/**
 * Send order confirmation SMS.
 */
export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  total: number | string
): Promise<SmsResult> {
  const formattedTotal = typeof total === "number" ? total.toFixed(2) : total;
  const body = `Your Mohawk Medibles order #${orderNumber} ($${formattedTotal}) has been received! Track at mohawkmedibles.ca/track-order`;
  return sendSMS(phone, body);
}

/**
 * Send shipping update SMS.
 */
export async function sendShippingUpdateSMS(
  phone: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
): Promise<SmsResult> {
  const trackingUrl = carrier.toLowerCase().includes("canada post")
    ? `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}`
    : `https://parcelsapp.com/en/tracking/${trackingNumber}`;

  const body = `Your order #${orderNumber} has shipped via ${carrier}! Track: ${trackingUrl}`;
  return sendSMS(phone, body);
}

/**
 * Send delivery confirmation SMS.
 */
export async function sendDeliveryConfirmationSMS(
  phone: string,
  orderNumber: string
): Promise<SmsResult> {
  const body = `Your order #${orderNumber} has been delivered! Enjoy \u{1F33F}`;
  return sendSMS(phone, body);
}

/**
 * Send promotional SMS.
 */
export async function sendPromoSMS(
  phone: string,
  message: string
): Promise<SmsResult> {
  const body = `${message}\n\nReply STOP to unsubscribe. Mohawk Medibles`;
  return sendSMS(phone, body);
}

/**
 * Log an SMS to the database (non-blocking helper).
 */
export async function logSmsToDb(params: {
  phone: string;
  message: string;
  status: string;
  type: string;
  orderId?: string;
  userId?: string;
  error?: string;
  messageId?: string;
}): Promise<void> {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.smsLog.create({
      data: {
        phone: params.phone,
        message: params.message,
        status: params.status,
        type: params.type,
        orderId: params.orderId || null,
        error: params.error || null,
        providerMessageId: params.messageId || null,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[SMS] Failed to log SMS to DB:", err);
  }
}

/**
 * Send SMS and log to database — combined helper for order flows.
 */
export async function sendAndLogSMS(params: {
  phone: string;
  message: string;
  type: string;
  orderId?: string;
  userId?: string;
}): Promise<SmsResult> {
  const result = await sendSMS(params.phone, params.message);

  // Fire and forget the DB log
  logSmsToDb({
    phone: params.phone,
    message: params.message,
    status: result.success ? "SENT" : "FAILED",
    type: params.type,
    orderId: params.orderId,
    userId: params.userId,
    error: result.error,
    messageId: result.messageId,
  }).catch(() => {});

  return result;
}
