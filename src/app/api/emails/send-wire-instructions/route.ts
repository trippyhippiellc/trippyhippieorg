import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/emails/send-wire-instructions
 * Send wire transfer payment instructions to user
 */

interface SendWireInstructionsRequest {
  orderId: string;
  amount: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as SendWireInstructionsRequest;
    const { orderId, amount } = body;

    // Get wire transfer details from environment
    const bankName = process.env.WIRE_BANK_NAME || "Your Bank";
    const accountName = process.env.WIRE_ACCOUNT_NAME || "Trippy Hippie Wholesale LLC";
    const accountNumber = process.env.WIRE_ACCOUNT_NUMBER || "XXXXXXXX";
    const routingNumber = process.env.WIRE_ROUTING_NUMBER || "XXXXXXXXX";

    // Create email content
    const emailContent = `
      <h2>Wire Transfer Instructions</h2>
      <p>Thank you for choosing Trippy Hippie! Here are your wire transfer payment details:</p>
      
      <h3>Bank Details:</h3>
      <ul>
        <li><strong>Bank Name:</strong> ${bankName}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>Account Number:</strong> ${accountNumber}</li>
        <li><strong>Routing Number:</strong> ${routingNumber}</li>
        <li><strong>Amount to Send:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Order ID:</strong> ${orderId}</li>
      </ul>
      
      <p><strong>Important:</strong> Please include your Order ID in the wire transfer reference so we can match the payment to your order.</p>
      
      <p>A team member will reach out within 24 hours to coordinate and ensure your payment is received smoothly.</p>
      
      <p>Questions? Contact us at support@trippyhippie.org</p>
    `;

    // Log for now (implement actual email sending via Resend or similar)
    console.log("Wire transfer instructions email would be sent:", {
      to: user.email,
      amount,
      orderId,
    });

    return NextResponse.json(
      { message: "Wire instructions sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
