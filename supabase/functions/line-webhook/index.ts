import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function replyMessage(replyToken: string, text: string) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }]
    })
  })
}

async function getImageAndAnalyze(messageId: string): Promise<string> {
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
  })
  const buffer = await res.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

  const claude = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 }
          },
          {
            type: 'text',
            text: 'この画像を見て、在留カードかタイムシートか判断してください。在留カードの場合：名前、国籍、在留資格、在留期限をJSON形式で返してください。タイムシートの場合：日付、出勤時間、退勤時間をJSON形式で返してください。JSONのみ返してください。'
          }
        ]
      }]
    })
  })
  const data = await claude.json()
  return data.content[0].text
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('OK', { status: 200 })

  const body = await req.json()
  const events = body.events || []

  for (const event of events) {
    if (event.type === 'message') {
      const { replyToken, message, source } = event
      const lineUserId = source.userId

      if (message.type === 'image') {
        try {
          await replyMessage(replyToken, '📸 画像を受信しました。読み取り中...')
          const result = await getImageAndAnalyze(message.id)
          
          // Save to Supabase
          await sb.from('line_ocr_results').insert({
            line_user_id: lineUserId,
            raw_result: result,
            created_at: new Date().toISOString()
          })

          await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              to: lineUserId,
              messages: [{ type: 'text', text: `✅ 読み取り完了！\n${result}` }]
            })
          })
        } catch (e) {
          await replyMessage(replyToken, '❌ エラーが発生しました。もう一度お試しください。')
        }
      } else if (message.type === 'text') {
        await replyMessage(replyToken, '📸 在留カードまたはタイムシートの写真を送ってください！')
      }
    }
  }

  return new Response('OK', { status: 200 })
})
