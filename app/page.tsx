"use client"

import { useState } from 'react';
import { Snippet } from "@nextui-org/snippet";
import { Input } from "@nextui-org/input";
import { title, subtitle } from "@/components/primitives";
import { Button } from '@nextui-org/button';

export default function Home() {
  const [file, setFile] = useState<File>();
  const [transcription, setTranscription] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setTranscription(null);
    setError(null);

    try {
      const data = new FormData();
      data.set('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());

      // Parse the JSON response
      const result = await res.json();
      const transcription = result.transcript; // Ensure this matches your API's response structure
      setTranscription(transcription);

      // Do not call generateInsights here to avoid double-calling
    } catch (e: any) {
      console.error(e);
      setError('An error occurred while uploading the file.');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (transcription: string) => {
    try {
      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription }),
      });
  
      if (!res.ok) throw new Error(await res.text());
  
      const result = await res.json();
      const insights = result.summary; // Debug the result to ensure it's what you expect
      setInsights(insights); // Ensure this matches the API's response structure
    } catch (e: any) {
      console.error(e);
      setError('An error occurred while generating insights.');
    }
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <h1 className={title({ color: "violet" })}>SoundScript&nbsp;</h1>
          <h1 className={title()}>
            Summarize Audio Effortlessly
          </h1>
          <h2 className={subtitle({ class: "mt-4" })}>
            Accurate, fast, and intelligent.
          </h2>
        </div>

        <div className="mt-8">
          <form onSubmit={onSubmit}>
            <Snippet hideCopyButton hideSymbol variant="bordered" className="m-1">
              <span className={subtitle({ class: "mt-1" })}>
                <Input
                  type="file"
                  name="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="max-w-xs"
                />
              </span>
              <span className={subtitle({ class: "mt-3" })}>
                <Input type='submit' value='Upload' />
              </span>
            </Snippet>
          </form>
        </div>

        {loading && <p className='m-6 p-4'>Loading...</p>} {/* Loading state */}

        {transcription && (
          <div className='m-6 p-4 border border-slate-700 rounded-lg'>
            <h2>Transcription:</h2>
            <p>{transcription}</p>
            <Button className='mt-12 ' onClick={() => generateInsights(transcription)}>
              Generate Insights
            </Button>
          </div>
        )}

        {insights && (
          <div className='m-6 p-4 border border-slate-700 rounded-lg'>
            <h2>Summary:</h2>
            <p>{insights}</p>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </section>
    </>
  );
}
