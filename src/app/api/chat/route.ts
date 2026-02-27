import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, model } = await req.json()

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are Claude, a warm and thoughtful AI companion.',
          },
          ...messages,
        ],
      }),
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'API error occurred' },
        { status: 500 }
      )
    }

    const content = data.choices?.[0]?.message?.content || 'No response received.'
    const usage = data.usage || null

    return NextResponse.json({
      content,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens || 0,
            completionTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
          }
        : null,
      model: data.model || model,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from Claude' },
      { status: 500 }
    )
  }
}
