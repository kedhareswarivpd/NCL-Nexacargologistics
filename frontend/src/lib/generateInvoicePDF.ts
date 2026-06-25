import jsPDF from "jspdf";

export interface InvoicePDFData {
  txRef: string;
  invoiceId: string;
  shipment: string;
  route: string;
  amount: number;
  paymentMethod: string;
  dateTime: string;
}

export function generateInvoicePDF(data: InvoicePDFData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const navy = [11, 31, 58] as const;
  const blue = [30, 136, 229] as const;
  const cyan = [0, 194, 255] as const;
  const gray = [100, 116, 139] as const;
  const light = [241, 245, 249] as const;

  // Header background
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 90, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("NexaCargo", 40, 38);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...cyan);
  doc.text("GLOBAL LOGISTICS PLATFORM", 40, 52);

  // INVOICE label (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...cyan);
  doc.text("INVOICE", W - 40, 44, { align: "right" });

  // Invoice meta (right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 220);
  doc.text(`Invoice No: ${data.invoiceId}`, W - 40, 60, { align: "right" });
  doc.text(`Date: ${data.dateTime}`, W - 40, 73, { align: "right" });

  // Divider
  doc.setDrawColor(...blue);
  doc.setLineWidth(2);
  doc.line(40, 108, W - 40, 108);

  // Status badge
  doc.setFillColor(0, 194, 255);
  doc.roundedRect(40, 118, 90, 22, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 31, 58);
  doc.text("✓  CONFIRMED", 85, 133, { align: "center" });

  // Transaction ref
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(`Transaction Reference: `, W - 40, 128, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.text(data.txRef, W - 40, 141, { align: "right" });

  // Bill To section
  let y = 168;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("BILL TO", 40, y);

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...navy);
  doc.text("NexaCargo Customer", 40, y);

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("customer@nexacargo.com", 40, y);

  // Shipment details section (right side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("SHIPMENT DETAILS", W / 2 + 20, 168);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text(`Shipment ID:  ${data.shipment}`, W / 2 + 20, 182);
  doc.text(`Route:  ${data.route}`, W / 2 + 20, 196);

  // Table header
  y = 230;
  doc.setFillColor(...light);
  doc.rect(40, y, W - 80, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text("DESCRIPTION", 55, y + 18);
  doc.text("PAYMENT METHOD", W / 2, y + 18);
  doc.text("AMOUNT (USD)", W - 55, y + 18, { align: "right" });

  // Table row
  y += 28;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, W - 40, y);

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Freight Invoice — ${data.invoiceId}`, 55, y);
  doc.text(data.paymentMethod, W / 2, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blue);
  doc.text(`$ ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, W - 55, y, { align: "right" });

  // Row bottom border
  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(40, y, W - 40, y);

  // Processing fee row
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Processing Fee", 55, y);
  doc.text("—", W / 2, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("$ 0.00", W - 55, y, { align: "right" });

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(40, y, W - 40, y);

  // Total box
  y += 16;
  doc.setFillColor(...navy);
  doc.roundedRect(W - 220, y, 180, 48, 6, 6, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 220);
  doc.text("TOTAL AMOUNT PAID", W - 130, y + 16, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 194, 255);
  doc.text(
    `$ ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`,
    W - 130, y + 36, { align: "center" }
  );

  // Security note
  y += 80;
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(40, y, W - 80, 36, 4, 4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(
    "🔒  Secured by 256-bit SSL encryption  ·  PCI DSS Compliant  ·  NexaCargo Payment Gateway v3.1",
    W / 2, y + 15, { align: "center" }
  );
  doc.text(
    "This is a computer-generated invoice and does not require a physical signature.",
    W / 2, y + 27, { align: "center" }
  );

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 36;
  doc.setFillColor(...navy);
  doc.rect(0, footerY, W, 36, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text("NexaCargo Global Logistics Platform  ·  info@nexacargo.com  ·  +8801711456789", W / 2, footerY + 15, { align: "center" });
  doc.text("© 2025 NexaCargo. All rights reserved.", W / 2, footerY + 27, { align: "center" });

  doc.save(`NexaCargo-Invoice-${data.invoiceId}.pdf`);
}
