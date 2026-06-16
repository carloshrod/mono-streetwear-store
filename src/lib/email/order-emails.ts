import { resend } from "./client";
import { formatPrice } from "@/lib/utils";
import type { Address } from "@/types/user";

const FROM_EMAIL = process.env.EMAIL_FROM ?? "MONO <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type OrderEmailItem = {
  name: string;
  size: string | null;
  quantity: number;
  unitPrice: number; // cents
};

export type OrderEmailData = {
  orderId: string;
  totalAmount: number; // cents, includes shipping
  shippingAmount: number; // cents
  items: OrderEmailItem[];
  shippingAddress: Address;
};

const itemsRows = (items: OrderEmailItem[]) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <p style="margin:0;font-weight:600;color:#111;">${item.name}</p>
            <p style="margin:2px 0 0;font-size:13px;color:#888;">
              ${item.size ? `Size ${item.size} &middot; ` : ""}Qty ${item.quantity}
            </p>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#111;white-space:nowrap;">
            ${formatPrice(item.unitPrice * item.quantity)}
          </td>
        </tr>`
    )
    .join("");

const totalsTable = (order: OrderEmailData) => {
  const subtotal = order.totalAmount - order.shippingAmount;

  return `
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding-top:4px;color:#666;font-size:14px;">Subtotal</td>
        <td style="padding-top:4px;text-align:right;color:#666;font-size:14px;">
          ${formatPrice(subtotal)}
        </td>
      </tr>
      <tr>
        <td style="padding-top:4px;color:#666;font-size:14px;">Shipping</td>
        <td style="padding-top:4px;text-align:right;color:#666;font-size:14px;">
          ${order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}
        </td>
      </tr>
      <tr>
        <td style="padding-top:12px;font-weight:700;color:#111;">Total</td>
        <td style="padding-top:12px;text-align:right;font-weight:700;color:#111;">
          ${formatPrice(order.totalAmount)}
        </td>
      </tr>
    </table>
  `;
};

export const sendOrderConfirmationEmail = async (
  to: string,
  order: OrderEmailData
) => {
  const orderRef = order.orderId.slice(0, 8).toUpperCase();
  const addr = order.shippingAddress;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order confirmed — #${orderRef}`,
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 4px;">MONO</p>
        <h1 style="font-size:22px;margin:0 0 24px;color:#111;">Thanks for your order</h1>
        <p style="font-size:14px;color:#555;margin:0 0 24px;">
          Order <strong>#${orderRef}</strong> is confirmed and being processed.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${itemsRows(order.items)}
        </table>
        ${totalsTable(order)}
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:0 0 8px;">
            Shipping to
          </p>
          <p style="font-size:14px;color:#333;margin:0;line-height:1.5;">
            ${addr.full_name}<br/>
            ${addr.line1}<br/>
            ${addr.line2 ? `${addr.line2}<br/>` : ""}
            ${addr.city}, ${addr.state} ${addr.postal_code}<br/>
            ${addr.country}
          </p>
        </div>
      </div>
    `,
  });
};

export const sendAdminNewOrderEmail = async (
  order: OrderEmailData & { customerEmail: string }
) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  const orderRef = order.orderId.slice(0, 8).toUpperCase();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `New order — #${orderRef} (${formatPrice(order.totalAmount)})`,
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 4px;">MONO Admin</p>
        <h1 style="font-size:22px;margin:0 0 16px;color:#111;">New order received</h1>
        <p style="font-size:14px;color:#555;margin:0 0 24px;">
          From <strong>${order.customerEmail}</strong>
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          ${itemsRows(order.items)}
        </table>
        <div style="margin-bottom:24px;">
          ${totalsTable(order)}
        </div>
        <a href="${APP_URL}/admin/orders/${order.orderId}"
           style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">
          View order in admin
        </a>
      </div>
    `,
  });
};
