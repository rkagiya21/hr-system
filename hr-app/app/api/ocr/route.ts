import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    
    // Strip data URL prefix if present
    const base64 = image.includes(',') ? image.split(',')[1] : image;
    const mime = mediaType || 'image/jpeg';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
            { type: 'text', text: 'このタイムシートの画像から勤怠情報を読み取り、JSONのみ返してください。形式：[{"name":"氏名","date":"YYYY-MM-DD","clock_in":"HH:MM","clock_out":"HH:MM","total_hours":0}]' }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic 400:', JSON.stringify(data));
      return NextResponse.json({ error: data }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('OCR error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
