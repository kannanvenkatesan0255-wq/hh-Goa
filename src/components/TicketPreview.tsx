/**
 * TicketPreview Component for displaying the generated boarding pass
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  Download,
  Share2,
  RotateCcw,
  Eye,
  X,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { renderBoardingPassToCanvas } from '../utils/boardingPassRenderer';

interface TicketPreviewProps {
  name: string;
  date: string;
  photoUrl: string | null;
  photoPosition: { x: number; y: number; zoom: number };
  onReset: () => void;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({
  name,
  date,
  photoUrl,
  photoPosition,
  onReset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullViewModal, setShowFullViewModal] = useState(false);

  // Current generated image state
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Load photo image object when photoUrl changes
  useEffect(() => {
    if (!photoUrl) {
      setPhotoImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setPhotoImg(img);
    };
    img.onerror = () => {
      console.error('Failed to load image:', photoUrl);
      setPhotoImg(null);
    };
    img.src = photoUrl;
  }, [photoUrl]);

  // Re-render canvas whenever parameters or loaded image changes
  useEffect(() => {
    if (canvasRef.current) {
      renderBoardingPassToCanvas(canvasRef.current, {
        name,
        date,
        photoImage: photoImg,
        photoPosition,
      });

      // Capture rendered base64 image and clear stale share state for new generation
      try {
        const base64 = canvasRef.current.toDataURL('image/png');
        setCurrentImageBase64(base64);
        setShareUrl(null); // Clear previous share ID/URL for new image
      } catch (e) {
        console.error('Failed to capture canvas image:', e);
      }
    }
  }, [name, date, photoImg, photoPosition]);

  const sanitizeFilename = (rawName: string) => {
    return (rawName || 'Passenger')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getDynamicCaption = () => {
    const formattedName = name.trim() || 'Passenger';
    const formattedDate = date.trim() || '11 – 13 DEC 2026';
    return `✈️ Boarding pass secured for ${formattedDate}!\n\nI'm heading to Hacker House Goa 2026.\n\nSee you in Goa, ${formattedName}!\n\n#FrameInGoa`;
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const safeName = sanitizeFilename(name);
        link.download = `HH-Goa-2026-${safeName}-Boarding-Pass.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } catch (err) {
        console.error('Download error:', err);
      } finally {
        setDownloading(false);
      }
    }, 150);
  };

  const handleShareToX = async () => {
    if (!canvasRef.current || !currentImageBase64) return;
    setIsSharing(true);

    const caption = getDynamicCaption();

    try {
      let currentShareUrl = shareUrl;

      // Ensure share record exists on backend so X can crawl og:image
      if (!currentShareUrl) {
        const res = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImageBase64,
            name: name.trim() || 'Passenger',
            date: date.trim() || '11 – 13 DEC 2026',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          currentShareUrl = data.shareUrl;
          setShareUrl(currentShareUrl);
        }
      }

      // Directly open X Tweet Intent with caption & pass URL for Twitter OG preview
      const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
        caption
      )}${currentShareUrl ? `&url=${encodeURIComponent(currentShareUrl)}` : ''}`;

      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to prepare share URL for X:', err);
      // Direct tweet intent fallback
      const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(caption)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      setShowShareModal(true);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white border border-[#e2ded4] rounded-xl p-5 sm:p-6 text-[#092130] shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e2ded4]">
        <div>
          <h3 className="text-base font-black text-[#092130] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#095755]" /> Live Pass Preview
          </h3>
          <p className="text-[11px] text-slate-500">1600 × 900 High Resolution PNG</p>
        </div>

        <button
          onClick={() => setShowFullViewModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] text-xs font-semibold border border-[#dcd7cc] transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#095755]" /> Fullscreen
        </button>
      </div>

      {/* Main Boarding Pass Canvas (16:9 Aspect Ratio) */}
      <div className="relative group w-full bg-[#f6f3eb] rounded-lg overflow-hidden border border-[#dcd7cc] shadow-sm p-1.5 sm:p-2">
        <div className="relative w-full aspect-[16/9] flex items-center justify-center overflow-hidden rounded">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain rounded shadow-sm cursor-pointer transition-transform duration-200 group-hover:scale-[1.005]"
            onClick={() => setShowFullViewModal(true)}
          />
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* DOWNLOAD PASS BUTTON */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#095755] hover:bg-[#0c6b69] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          {downloadSuccess ? (
            <>
              <FileCheck className="w-4 h-4 text-emerald-300" />
              DOWNLOADED!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              DOWNLOAD PASS
            </>
          )}
        </button>

        {/* SHARE TO X BUTTON */}
        <button
          onClick={handleShareToX}
          disabled={!currentImageBase64 || isSharing}
          className="w-full bg-[#000000] hover:bg-[#1a1a1a] active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          {isSharing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Preparing Share...
            </>
          ) : (
            <>
              <span className="font-mono text-base leading-none">𝕏</span>
              Share to X
            </>
          )}
        </button>
      </div>

      {/* Reset */}
      <div className="pt-1 text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] text-xs font-semibold border border-[#dcd7cc] transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#095755]" />
          Create Another Pass
        </button>
      </div>

      {/* X SHARE INSTRUCTION MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2ded4] rounded-xl max-w-md w-full p-5 text-[#092130] space-y-3 shadow-2xl relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-mono text-lg font-bold">
              𝕏
            </div>

            <h4 className="text-lg font-black text-[#092130]">X Composer Opened</h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your personalized caption and pass link have been sent to X with hashtag{' '}
              <span className="text-[#095755] font-bold">#FrameInGoa</span>!
            </p>

            <div className="bg-[#faf8f3] p-3 rounded-lg border border-[#dcd7cc] text-xs font-mono text-[#095755] whitespace-pre-line">
              {getDynamicCaption()}
            </div>

            {shareUrl && (
              <div className="bg-[#f1ede2] p-2.5 rounded-lg border border-[#dcd7cc] text-xs font-mono text-slate-700 truncate">
                <span className="font-bold text-[#092130]">Pass Link: </span>
                <a href={shareUrl} target="_blank" rel="noreferrer" className="text-[#095755] underline">
                  {shareUrl}
                </a>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
              <Download className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
              <p>
                Optionally attach your downloaded PNG (
                <span className="font-mono underline">
                  HH-Goa-2026-{sanitizeFilename(name)}-Boarding-Pass.png
                </span>
                ) to your tweet on X.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleDownload}
                className="flex-1 bg-[#095755] hover:bg-[#0c6b69] text-white text-xs font-extrabold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Pass
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-3 py-2.5 bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] text-xs font-bold rounded-lg border border-[#dcd7cc]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL VIEW PREVIEW MODAL */}
      {showFullViewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-white border border-[#e2ded4] rounded-xl p-4 text-[#092130] space-y-3 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2ded4]">
              <h4 className="text-base font-black text-[#092130] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#095755]" /> Master Boarding Pass
              </h4>
              <button
                onClick={() => setShowFullViewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[16/9] flex items-center justify-center bg-[#f6f3eb] rounded-lg overflow-hidden border border-[#dcd7cc]">
              <img
                src={canvasRef.current?.toDataURL('image/png')}
                alt="HH Goa 2026 Boarding Pass Full View"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-xs text-slate-500">
                1600 × 900 PNG • High Resolution
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-[#095755] hover:bg-[#0c6b69] text-white text-xs font-extrabold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
                <button
                  onClick={() => setShowFullViewModal(false)}
                  className="px-3 py-2 bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] text-xs font-bold rounded-lg border border-[#dcd7cc]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


