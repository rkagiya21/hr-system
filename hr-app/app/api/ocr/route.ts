import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { base64, mediaType } = await req.json();
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: base64 } },
          { type: 'text', text: `このタイムシートまたは勤怠表の画像を読み取ってください。手書きや印刷に関わらず、以下の情報を抽出してJSON配列で返してください：name(氏名), date(YYYY-MM-DD), clock_in(HH:MM), clock_out(HH:MM), total_hours(数値), overtime(数値)。複数人または複数日のデータがある場合は全て含めてください。JSONのみ返してください。形式: [{"name":"...","date":"...","clock_in":"...","clock_out":"...","total_hours":0,"overtime":0}]` }
        ]
      }]
    })
  });
  
  const data = await res.json();
  return NextResponse.json(data);
}
