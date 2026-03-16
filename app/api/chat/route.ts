import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful customer service assistant for a fashion store.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return NextResponse.json({
    reply: completion.choices[0].message.content,
  });
}