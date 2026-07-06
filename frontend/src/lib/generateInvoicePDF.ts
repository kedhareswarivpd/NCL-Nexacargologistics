import jsPDF from "jspdf";

export interface InvoicePDFData {
  txRef: string;
  invoiceId: string;
  shipment: string;
  route: string;
  origin?: string;
  destination?: string;
  amount: number;
  paymentMethod: string;
  dateTime: string;
  customerName?: string;
  customerEmail?: string;
}

export function generateInvoicePDF(data: InvoicePDFData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const navy = [11, 31, 58] as const;
  const blue = [30, 136, 229] as const;
  const cyan = [0, 194, 255] as const;
  const gray = [100, 116, 139] as const;
  const lightGray = [226, 232, 240] as const;
  const darkText = [30, 41, 59] as const;

  const formattedDate = data.dateTime
    ? new Date(data.dateTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 100, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("NexaCargo", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...cyan);
  doc.text("GLOBAL LOGISTICS PLATFORM", 40, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 185, 210);
  doc.text("123 Cargo Street, Dhaka, Bangladesh", 40, 70);
  doc.text("info@nexacargo.com  ·  +880 1711 456789", 40, 82);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...cyan);
  doc.text("INVOICE", W - 40, 48, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 220);
  doc.text(`Invoice No:  ${data.invoiceId}`, W - 40, 66, { align: "right" });
  doc.text(`Date:  ${formattedDate}`, W - 40, 80, { align: "right" });

  // ── Blue accent line ────────────────────────────────────────────────────────
  doc.setFillColor(...blue);
  doc.rect(0, 100, W, 4, "F");

  // ── Bill To + Shipment Details ──────────────────────────────────────────────
  let y = 130;

  // Left: Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("BILL TO", 40, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(data.customerName ?? "NexaCargo Customer", 40, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(data.customerEmail ?? "customer@nexacargo.com", 40, y + 30);

  // Right: Shipment Details
  const rx = W / 2 + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("SHIPMENT DETAILS", rx, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkText);
  doc.text(`Shipment ID:`, rx, y + 16);
  doc.setFont("helvetica", "bold");
  doc.text(data.shipment, rx + 72, y + 16);

  doc.setFont("helvetica", "normal");
  doc.text(`Route:`, rx, y + 30);
  doc.setFont("helvetica", "bold");
  doc.text(data.route !== "—" ? data.route : "N/A", rx + 40, y + 30);

  if (data.origin) {
    doc.setFont("helvetica", "normal");
    doc.text(`Origin:`, rx, y + 44);
    doc.setFont("helvetica", "bold");
    doc.text(data.origin, rx + 42, y + 44);
  }
  if (data.destination) {
    doc.setFont("helvetica", "normal");
    doc.text(`Destination:`, rx, y + 58);
    doc.setFont("helvetica", "bold");
    doc.text(data.destination, rx + 68, y + 58);
  }

  // ── Transaction ref row ─────────────────────────────────────────────────────
  y = 210;
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(40, y, W - 80, 28, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...gray);
  doc.text("Transaction Reference:", 55, y + 17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.text(data.txRef, 175, y + 17);

  // ── Line items table ────────────────────────────────────────────────────────
  y = 260;
  // Table header
  doc.setFillColor(...navy);
  doc.rect(40, y, W - 80, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", 55, y + 17);
  doc.text("QTY", W / 2 - 20, y + 17, { align: "center" });
  doc.text("UNIT PRICE", W - 160, y + 17, { align: "right" });
  doc.text("AMOUNT", W - 55, y + 17, { align: "right" });

  // Row 1 — Freight charge
  y += 26;
  doc.setFillColor(250, 252, 255);
  doc.rect(40, y, W - 80, 28, "F");
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.rect(40, y, W - 80, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text(`Freight Charge — ${data.invoiceId}`, 55, y + 18);
  doc.text("1", W / 2 - 20, y + 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`$ ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, W - 160, y + 18, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.text(`$ ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, W - 55, y + 18, { align: "right" });

  // Row 2 — Processing fee
  y += 28;
  doc.setFillColor(255, 255, 255);
  doc.rect(40, y, W - 80, 28, "F");
  doc.setDrawColor(...lightGray);
  doc.rect(40, y, W - 80, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.text("Processing Fee", 55, y + 18);
  doc.text("1", W / 2 - 20, y + 18, { align: "center" });
  doc.setTextColor(...gray);
  doc.text("$ 0.00", W - 160, y + 18, { align: "right" });
  doc.text("$ 0.00", W - 55, y + 18, { align: "right" });

  // ── Subtotal / Total block ──────────────────────────────────────────────────
  y += 44;
  const boxX = W - 230;
  const boxW = 190;

  // Subtotal line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("Subtotal", boxX, y);
  doc.text(`$ ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, boxX + boxW, y, { align: "right" });

  y += 14;
  doc.text("Tax / VAT", boxX, y);
  doc.text("$ 0.00", boxX + boxW, y, { align: "right" });

  y += 8;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(boxX, y, boxX + boxW, y);

  // Total box
  y += 10;
  doc.setFillColor(...navy);
  doc.roundedRect(boxX - 10, y, boxW + 10, 58, 6, 6, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(160, 185, 210);
  doc.text("TOTAL AMOUNT DUE", boxX + (boxW / 2) - 5, y + 16, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...cyan);
  doc.text(
    `$ ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`,
    boxX + (boxW / 2) - 5, y + 36, { align: "center" }
  );

  // CONFIRMED badge inside the total box
  doc.setFillColor(...cyan);
  doc.roundedRect(boxX + (boxW / 2) - 45, y + 42, 90, 10, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...navy);
  doc.text("✓  CONFIRMED", boxX + (boxW / 2) - 5, y + 50, { align: "center" });

  // ── Notes ───────────────────────────────────────────────────────────────────
  y += 80;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("NOTES", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  doc.text("Payment is due within 30 days of invoice date. Please include the invoice number in your payment reference.", 40, y + 14, { maxWidth: W - 260 });

  // ── Security strip ──────────────────────────────────────────────────────────
  y += 50;
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(40, y, W - 80, 30, 4, 4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...gray);
  doc.text("Secured by 256-bit SSL encryption  ·  PCI DSS Compliant", W / 2, y + 12, { align: "center" });
  doc.text("This is a computer-generated invoice and does not require a physical signature.", W / 2, y + 23, { align: "center" });

  // ── Footer ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, H - 40, W, 40, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text("NexaCargo Global Logistics  ·  123 Cargo Street, Dhaka, Bangladesh  ·  info@nexacargo.com", W / 2, H - 22, { align: "center" });
  doc.text("© 2025 NexaCargo. All rights reserved.", W / 2, H - 10, { align: "center" });

  doc.save(`NexaCargo-Invoice-${data.invoiceId}.pdf`);
}
