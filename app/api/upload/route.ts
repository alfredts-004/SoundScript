import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file locally
    const FILE_URL = `./${file.name}`;
    await writeFile(FILE_URL, buffer);
    console.log(`open ${FILE_URL} to see the uploaded file`);

    const client = new AssemblyAI({
        apiKey: 'dd8becfcbf0e4e808226f7a8b2e56cf3',
    });

    try {
        // Transcribe the audio file
        const transcript = await client.transcripts.transcribe({ audio: FILE_URL });

        // Check if transcription was successful
        if (transcript.status === 'error') {
            console.error(transcript.error);
            return NextResponse.json({ success: false, error: transcript.error });
        }
        
    
        // Return the transcribed text
        return NextResponse.json({ success: true, transcript: transcript.text });

    } catch (error) {
        // Narrow down the type of error to handle it correctly
        if (error instanceof Error) {
            console.error('Error during transcription:', error.message);
            return NextResponse.json({ success: false, error: error.message });
        } else {
            console.error('Unexpected error during transcription:', error);
            return NextResponse.json({ success: false, error: 'An unexpected error occurred' });
        }
    }
}
