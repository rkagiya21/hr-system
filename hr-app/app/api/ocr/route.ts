import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    
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
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } },
            { type: 'text', text: 'このタイムシートまたは勤怠表の画像を読み取ってください。以下の情報をJSON配列で返してください：name(氏名)、date(YYYY-MM-DD)、clock_in(HH:MM)、clock_out(HH:MM)、total_hours(数値)。JSONのみ返してください。形式：[{"name":"...","date":"...","clock_in":"...","clock_out":"...","total_hours":0}]' }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('OCR route error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
