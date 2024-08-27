import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Summary } from '@/components/summary';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription is required' }, { status: 400 });
    }

    // Define the prompt based on the transcription
    const prompt = `Summarize the following transcription in 4 lines:\n\n${transcription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return NextResponse.json({ success: true, summary: text });

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
