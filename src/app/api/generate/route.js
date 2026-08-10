import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { jobDescription, recipientEmail } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    // Call actual n8n workflow
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        recipientEmail,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n error response:', errorText);
      throw new Error(`n8n webhook responded with status: ${response.status}. Details: ${errorText}`);
    }

    // n8n returns JSON
    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error generating application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process application' },
      { status: 500 }
    );
  }
}
