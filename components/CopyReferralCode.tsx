"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export function CopyReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://mohawkmedibles.ca/register?ref=${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mohawk Medibles Referral",
          text: `Use my referral code ${code} to sign up and we both earn rewards!`,
          url: referralUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-white hover:border-primary/50 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}
