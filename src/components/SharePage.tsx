import React, { useEffect, useState } from 'react';
import { Download, Sparkles, PlusCircle, Share2, Check, ArrowLeft } from 'lucide-react';

interface SharePageProps {
  shareId: string;
}

interface ShareData {
  id: string;
  name: string;
  date: string;
  shareUrl: string;
  imageUrl: string;
}

export const SharePage: React.FC<SharePageProps> = ({ shareId }) => {
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share-data/${shareId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load share data:', err);
        setError(true);
        setLoading(false);
      });
  }, [shareId]);

  const handleDownload = () => {
    if (!data) return;
    const link = document.createElement('a');
    const safeName = (data.name || 'Passenger').replace(/[^a-zA-Z0-9]/g, '-');
    link.download = `HH-Goa-2026-${safeName}-Boarding-Pass.png`;
    link.href = data.imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToX = () => {
    if (!data) return;
    const caption = `✈️ Boarding pass secured for ${data.date}!

I'm heading to Hacker House Goa 2026.

See you in Goa, ${data.name}!

#FrameInGoa

${data.shareUrl}`;

const tweetUrl = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#095755] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-[#092130]">Loading boarding pass...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white border border-[#e2ded4] p-8 rounded-2xl max-w-md w-full shadow-sm space-y-4">
          <h2 className="text-xl font-black text-[#092130]">Pass Not Found</h2>
          <p className="text-xs text-slate-600">
            This boarding pass link may have expired or is invalid. Create your own personalized pass for HH Goa 2026 below!
          </p>
          <button
            onClick={handleGoHome}
            className="w-full bg-[#095755] text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Create Your Pass
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#092130] py-8 px-4 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#095755] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Generator
          </button>

          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#095755] bg-[#095755]/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> HH Goa 2026
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#092130]">
            Hacker House Goa 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Official Boarding Pass for <span className="font-extrabold text-[#095755]">{data.name}</span>
          </p>
        </div>

        {/* Pass Graphic Card */}
        <div className="bg-white border border-[#e2ded4] rounded-2xl p-3 sm:p-5 shadow-md space-y-4">
          <div className="relative w-full aspect-[16/9] bg-[#f6f3eb] rounded-xl overflow-hidden border border-[#dcd7cc]">
            <img
              src={data.imageUrl}
              alt={`HH Goa 2026 Boarding Pass - ${data.name}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={handleShareToX}
              className="bg-[#000000] hover:bg-[#1a1a1a] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <span className="font-mono text-base leading-none">𝕏</span> Share to X
            </button>

            <button
              onClick={handleDownload}
              className="bg-[#095755] hover:bg-[#0c6b69] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Download className="w-4 h-4" /> Download Pass
            </button>

            <button
              onClick={handleCopyLink}
              className="bg-[#f1ede2] hover:bg-[#e6e0d2] text-[#092130] font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl border border-[#dcd7cc] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Link Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#095755]" /> Copy Pass Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Create Your Own Callout */}
        <div className="bg-[#f1ede2] border border-[#dcd7cc] rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-lg font-black text-[#092130]">Ready to build the future?</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Create your own official Hacker House Goa 2026 boarding pass in seconds with your photo, name, and boarding date.
          </p>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 bg-[#095755] hover:bg-[#0c6b69] text-white font-extrabold text-sm py-3 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> CREATE YOUR PASS
          </button>
        </div>
      </div>
    </div>
  );
};
