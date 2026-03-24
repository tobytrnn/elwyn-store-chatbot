import { NextResponse } from "next/server";
import OpenAI from "openai";
import { retrieveContext } from "@/lib/retrieveContext";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 🔥 1. Retrieve relevant business data
    const context = retrieveContext(message);

    // 🔥 2. Build context string
    const contextText = `
Relevant FAQs:
${context.matchedFaqs
        .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
        .join("\n\n")}

Relevant Policies:
${context.matchedPolicies
        .map((p) => `${p.title}: ${p.content}`)
        .join("\n\n")}

Relevant Products:
${context.matchedProducts
        .map(
          (p) => `
            Product: ${p.name}
            Price: ${p.price} ${p.currency}
            Sizes: ${p.sizes.join(", ")}
            Colors: ${p.colors.join(", ")}
            Stock: ${p.stockStatus}
            Description: ${p.description}
            `
        )
        .join("\n\n")}
`;
    // 🔥 3. Call OpenAI with grounded context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          You are Elwyn Bot, a customer support assistant for a modern fashion brand.

          Your tone should be:
          - warm
          - polished
          - professional
          - concise
          - natural, never robotic

          Response style rules:
          - Keep answers short and clear
          - Use 1 to 3 short paragraphs maximum
          - Do not sound overly technical
          - Do not repeat the user's exact question
          - Do not make up information
          - Only answer using the provided context
          - If the answer is not in the context, say:
            "I’m sorry, but I couldn’t find that information right now."
          - If helpful, gently guide the user to ask about products, sizing, shipping, or returns
          - For product questions, mention only the most relevant product details
          - For policy questions, summarize clearly instead of sounding too legal
          - If a question includes multiple parts, answer all parts clearly in one response

          Here is the store context:

${contextText}
      `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion.choices[0].message.content ||
      "I’m sorry, but I couldn’t generate a response right now.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}