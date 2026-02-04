import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, payload } = body;

    // Validate webhook URL
    if (!webhookUrl || 
        (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && 
         !webhookUrl.startsWith('https://discordapp.com/api/webhooks/'))) {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Forward to Discord
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!discordResponse.ok) {
      const text = await discordResponse.text();
      return NextResponse.json(
        { error: `Discord API error: ${discordResponse.status} - ${text}` },
        { status: discordResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Discord webhook proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

