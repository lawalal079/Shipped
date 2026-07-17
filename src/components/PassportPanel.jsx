import React from 'react';
import { isToday } from './ActivityCard';

export default function PassportPanel({ activities = [], address, balance = '0.0000', onRefreshBalance }) {
  const totalProofs = activities.reduce((sum, a) => sum + Number(a.totalCheckIns), 0);
  const [copied, setCopied] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshBalance = async () => {
    if (refreshing || !onRefreshBalance) return;
    setRefreshing(true);
    try {
      await onRefreshBalance();
    } finally {
      // Keep spin for at least 650ms so it feels responsive
      setTimeout(() => setRefreshing(false), 650);
    }
  };

  // Daily quota calculations
  const checkedInCount = activities.filter(a => isToday(a.lastCheckInDay)).length;
  const totalCount = activities.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  const QUOTES = [
    "Progress is the only currency.",
    "Nulla dies sine linea — no day without a line.",
    "What is signed in ink cannot be erased.",
    "We are what we repeatedly do.",
    "Write your actions in stone, not in sand.",
    "The only bad entry is the empty one.",
    "Details define the craftsman.",
    "Every stamp is a victory onchain."
  ];
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="parchment-texture p-gutter flex flex-col md:flex-row gap-gutter text-ink-black rounded-sm border border-outline-variant w-full">
      <div className="flex-1 space-y-6">
        <h3 className="font-display-lg text-headline-md text-ink-black border-b border-ink-black pb-2">
          Active Passport
        </h3>

        <div className="bg-black/5 p-4 ledger-line w-full">
          <span className="font-label-mono text-[10px] text-brand-muted uppercase">
            Total Proofs
          </span>
          <div className="font-stamp-lg text-title-sm text-ink-black mt-1">
            {totalProofs.toLocaleString()}
          </div>
        </div>

        {/* Ledger Wallet & Funding */}
        {address && (
          <div className="border-t border-black/10 pt-4 space-y-3">
            <span className="font-label-mono text-[10px] text-brand-muted uppercase block">
              Monad Ledger Wallet
            </span>
            <div className="flex items-center justify-between gap-2 bg-black/5 p-2 rounded-sm border border-outline-variant/35">
              <div className="font-mono text-xs text-ink-black truncate select-all flex-1" title={address}>
                {address}
              </div>
              <button
                onClick={handleCopy}
                className="font-label-mono text-[9px] uppercase text-brand-red border border-brand-red/35 px-2 py-0.5 hover:bg-brand-red hover:text-white transition-all flex-shrink-0"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-between items-center text-[11px] font-label-mono uppercase">
              <div className="flex items-center gap-1">
                <span className="text-brand-muted">Balance:</span>
                <span className="font-mono font-bold text-ink-black ml-1">{balance} MON</span>
                {/* Spinning refresh button — re-mounts icon on each click to restart animation */}
                <button
                  onClick={handleRefreshBalance}
                  title="Refresh balance"
                  aria-label="Refresh MON balance"
                  className="text-brand-muted hover:text-brand-red transition-colors focus:outline-none ml-1 leading-none"
                >
                  <span
                    key={refreshing ? 'spinning' : 'idle'}
                    className={`material-symbols-outlined text-[14px] leading-none align-middle ${refreshing ? 'spin-once' : ''}`}
                  >
                    refresh
                  </span>
                </button>
              </div>
              <a
                href="https://faucet.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline flex items-center gap-0.5"
              >
                Get Gas <span className="material-symbols-outlined text-[10px]">open_in_new</span>
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-outline-variant pt-6 md:pt-0 md:pl-gutter">
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="font-label-mono text-[11px] text-brand-muted uppercase block">
              Daily Quota
            </span>
            <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-red transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="font-label-mono text-[10px] text-brand-muted uppercase text-right">
              {checkedInCount} / {totalCount} Shipped
            </div>
          </div>
          <p className="font-body-sm text-ink-black/70 italic leading-relaxed">
            "{quote}"
          </p>
        </div>

        <div className="mt-8 border-t border-black/5 pt-4">
          <div className="font-stamp-lg text-[18px] text-brand-red opacity-60">
            CERTIFIED
          </div>
          <div className="font-label-mono text-[10px] text-brand-muted uppercase mt-1">
            Status: {address ? 'Verified Tracker' : 'Not Authenticated'}
          </div>
        </div>
      </div>
    </div>
  );
}
