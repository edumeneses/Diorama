import { generateText, stepCountIs } from 'ai'
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { BrowserTools } from 'bedrock-agentcore/browser/vercel-ai'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const credentialsProvider = async () => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    ...(process.env.AWS_SESSION_TOKEN && {
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }),
  })

  const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentialProvider: credentialsProvider,
  })

  const browser = new BrowserTools({ credentialsProvider })

  try {
    const { text } = await generateText({
      model: bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
      prompt: `Navigate to ${url}.
Find the single most visually prominent scene, landscape, or location image on the page.
Prefer: hero images, location photography, architectural photos, panoramic shots, nature photos.
Avoid: logos, icons, small thumbnails, profile pictures, UI elements, ads.
Return ONLY the absolute URL of the best image — no explanation, no markdown, just the raw URL.`,
      tools: { ...browser.tools },
      stopWhen: stepCountIs(10),
    })

    const imageUrl = text.trim()

    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: 'Could not extract a valid image from the page' },
        { status: 422 },
      )
    }

    return NextResponse.json({ image_url: imageUrl })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Browser extraction failed',
      },
      { status: 500 },
    )
  } finally {
    await browser.stopSession()
  }
}
