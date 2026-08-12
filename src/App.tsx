/**
 * HH Goa 2026 — Boarding Pass Generator
 * Master App Component
 */
import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { PassForm } from './components/PassForm';
import { TicketPreview } from './components/TicketPreview';
import { SharePage } from './components/SharePage';
import { MapPin, Sparkles } from 'lucide-react';
import { getSystemDefaultDate } from './utils/dateUtils';

export default function App() {
  // Check if viewing a shared pass route: /share/:id
  const pathname = window.location.pathname;
  const shareMatch = pathname.match(/^\/share\/([a-f0-9]+)$/i);
  if (shareMatch && shareMatch[1]) {
    return <SharePage shareId={shareMatch[1]} />;
  }
  // Input State
  const [name, setName] = useState<string>('Alex Rivera');
  const [date, setDate] = useState<string>(getSystemDefaultDate());
  // Initial photo is null - user uploads their own photograph
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPosition, setPhotoPosition] = useState<{
    x: number;
    y: number;
    zoom: number;
  }>({
    x: 0,
    y: 0,
    zoom: 1.0,
  });

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    photo?: string;
    date?: string;
  }>({});

  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    const newErrors: { name?: string; photo?: string; date?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name.';
    }
    if (!photoUrl) {
      newErrors.photo = 'Please upload your photo.';
    }
    if (!date.trim()) {
      newErrors.date = 'Please select your boarding date.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Scroll to preview smoothly on mobile
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    setName('');
    setDate(getSystemDefaultDate());
    setPhotoUrl(null);
    setPhotoPosition({ x: 0, y: 0, zoom: 1.0 });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#092130] flex flex-col font-sans selection:bg-[#095755] selection:text-white">
      {/* Top Navbar */}
      <Header />

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-start">
        {/* Simple Page Heading */}
        <div className="mb-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#095755]/10 border border-[#095755]/20 text-[#095755] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#095755]" /> HH Goa 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#092130] tracking-tight">
            Create your boarding pass.
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Add your name, photo and date to generate your pass. Your photo will automatically fit the frame.
          </p>
        </div>

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5">
            <PassForm
              name={name}
              setName={(v) => {
                setName(v);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              date={date}
              setDate={(v) => {
                setDate(v);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              photoUrl={photoUrl}
              setPhotoUrl={(v) => {
                setPhotoUrl(v);
                if (errors.photo) setErrors((prev) => ({ ...prev, photo: undefined }));
              }}
              photoPosition={photoPosition}
              setPhotoPosition={setPhotoPosition}
              onGenerate={handleGenerate}
              errors={errors}
            />
          </div>

          {/* Right Column: Live Master Pass Preview */}
          <div ref={previewRef} className="lg:col-span-7">
            <TicketPreview
              name={name}
              date={date}
              photoUrl={photoUrl}
              photoPosition={photoPosition}
              onReset={handleReset}
            />
          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full bg-[#f1ede2] border-t border-[#e2ded4] text-slate-600 py-3.5 px-4 text-center text-xs">
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#092130]">HACKER HOUSE GOA 2026</span>
            <span>•</span>
            <span className="text-[#095755] font-bold">#FrameInGoa</span>
          </div>

          <p className="hidden sm:flex items-center gap-1 text-slate-600 font-medium">
            Build • Connect • Explore <MapPin className="w-3.5 h-3.5 text-[#095755]" /> Goa, India
          </p>
        </div>
      </footer>
    </div>
  );
}


