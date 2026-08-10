import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const payload = await req.json();

    const sendEmailWebhookUrl = process.env.N8N_SEND_EMAIL_WEBHOOK_URL;

    const response = await fetch(sendEmailWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Send Email Webhook Error:', errorText);
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
