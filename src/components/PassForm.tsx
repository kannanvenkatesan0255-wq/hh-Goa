/**
 * PassForm Component for user input
 */
import React, { useRef, useState } from 'react';
import {
  Upload,
  User,
  Calendar,
  Image as ImageIcon,
  ZoomIn,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react';
import { getSystemDefaultDate, formatDateInputValue } from '../utils/dateUtils';

interface PassFormProps {
  name: string;
  setName: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  photoUrl: string | null;
  setPhotoUrl: (v: string | null) => void;
  photoPosition: { x: number; y: number; zoom: number };
  setPhotoPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; zoom: number }>
  >;
  onGenerate: () => void;
  errors: { name?: string; photo?: string; date?: string };
}

export const PassForm: React.FC<PassFormProps> = ({
  name,
  setName,
  date,
  setDate,
  photoUrl,
  setPhotoUrl,
  photoPosition,
  setPhotoPosition,
  onGenerate,
  errors,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, HEIC).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
        setPhotoPosition({ x: 0, y: 0, zoom: 1.0 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="bg-white border border-[#e2ded4] rounded-xl p-5 sm:p-6 text-[#092130] shadow-sm space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-lg font-black text-[#092130] tracking-tight">
          Passenger Information
        </h2>
        <p className="text-slate-600 text-xs mt-0.5">
          Enter details below to generate your boarding pass.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* 1. NAME FIELD */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#095755]" /> Your Name
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {name.length}/60
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            maxLength={60}
            className={`w-full bg-[#faf8f3] border ${
              errors.name ? 'border-red-500 bg-red-50/50' : 'border-[#dcd7cc]'
            } rounded-lg px-3.5 py-2.5 text-[#092130] placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-[#095755] focus:bg-white transition-all`}
          />
          {name.length >= 55 && (
            <p className="mt-1 text-[10px] text-amber-700 font-medium">
              Approaching 60 character limit. Name will auto-fit inside the pass frame.
            </p>
          )}
          {errors.name && (
            <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* 2. PHOTO FIELD */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#095755]" /> Your Photo
            </span>
          </label>

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer border-2 border-dashed rounded-lg p-4 text-center transition-all ${
              isDragging
                ? 'border-[#095755] bg-[#095755]/10'
                : photoUrl
                ? 'border-[#095755]/60 bg-[#095755]/5'
                : errors.photo
                ? 'border-red-400 bg-red-50/30'
                : 'border-[#dcd7cc] bg-[#faf8f3] hover:border-[#095755]/60 hover:bg-[#f5f2e8]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {photoUrl ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded overflow-hidden border border-[#095755] bg-slate-100 flex-shrink-0">
                    <img
                      src={photoUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#095755] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Photo Loaded
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ready to render inside ticket
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-2.5 py-1 rounded bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] text-xs font-semibold flex items-center gap-1 border border-[#dcd7cc]"
                  >
                    <RefreshCw className="w-3 h-3 text-[#095755]" /> Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdjustments(!showAdjustments);
                    }}
                    className="px-2.5 py-1 rounded bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] text-xs font-semibold flex items-center gap-1 border border-[#dcd7cc]"
                  >
                    <ZoomIn className="w-3 h-3 text-[#095755]" /> Adjust
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoUrl(null);
                    }}
                    className="p-1.5 rounded bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-3 flex flex-col items-center justify-center gap-1 text-slate-700">
                <div className="w-9 h-9 rounded-full bg-[#095755]/10 text-[#095755] flex items-center justify-center mb-1">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#092130]">Upload your photo</span>
                <span className="text-[11px] text-slate-500">JPG, PNG or supported image formats</span>
              </div>
            )}
          </div>

          {errors.photo && (
            <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.photo}
            </p>
          )}

          {/* Optional Photo Adjustments (Pan & Zoom inside photo window) */}
          {photoUrl && showAdjustments && (
            <div className="mt-2.5 p-3 bg-[#faf8f3] border border-[#dcd7cc] rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[#092130]">
                <span className="text-[#095755] text-[11px]">Adjust Position inside Frame</span>
                <button
                  type="button"
                  onClick={() => setPhotoPosition({ x: 0, y: 0, zoom: 1.0 })}
                  className="text-[10px] text-slate-500 hover:text-[#092130] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Zoom */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span>Zoom</span>
                    <span>{photoPosition.zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.2"
                    step="0.05"
                    value={photoPosition.zoom}
                    onChange={(e) =>
                      setPhotoPosition((prev) => ({
                        ...prev,
                        zoom: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#095755] bg-slate-200 rounded cursor-pointer h-1"
                  />
                </div>

                {/* Horizontal */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span>Horizontal</span>
                    <span>{photoPosition.x}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="2"
                    value={photoPosition.x}
                    onChange={(e) =>
                      setPhotoPosition((prev) => ({
                        ...prev,
                        x: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-[#095755] bg-slate-200 rounded cursor-pointer h-1"
                  />
                </div>

                {/* Vertical */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span>Vertical</span>
                    <span>{photoPosition.y}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="2"
                    value={photoPosition.y}
                    onChange={(e) =>
                      setPhotoPosition((prev) => ({
                        ...prev,
                        y: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-[#095755] bg-slate-200 rounded cursor-pointer h-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. DATE FIELD */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#095755]" /> Boarding Date
            </span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder={getSystemDefaultDate()}
              className={`flex-1 bg-[#faf8f3] border ${
                errors.date ? 'border-red-500 bg-red-50/50' : 'border-[#dcd7cc]'
              } rounded-lg px-3.5 py-2.5 text-[#092130] placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-[#095755] focus:bg-white transition-all`}
            />
            <input
              type="date"
              onChange={(e) => {
                if (e.target.value) {
                  setDate(formatDateInputValue(e.target.value));
                }
              }}
              className="bg-[#f1ede2] hover:bg-[#e6e0d2] border border-[#dcd7cc] rounded-lg px-2.5 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              title="Pick a date from calendar"
            />
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setDate(getSystemDefaultDate())}
              className={`text-[11px] px-2.5 py-1 rounded border font-semibold transition-all ${
                date === getSystemDefaultDate()
                  ? 'border-[#095755] bg-[#095755]/10 text-[#095755]'
                  : 'border-[#dcd7cc] bg-[#f1ede2] text-slate-700 hover:bg-[#e6e0d2]'
              }`}
            >
              Today ({getSystemDefaultDate()})
            </button>
          </div>

          {errors.date && (
            <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.date}
            </p>
          )}
        </div>

        {/* GENERATE BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onGenerate}
            className="w-full bg-[#095755] hover:bg-[#0c6b69] active:scale-[0.99] text-white font-extrabold text-sm py-3.5 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            GENERATE PASS
          </button>
        </div>
      </div>
    </div>
  );
};


