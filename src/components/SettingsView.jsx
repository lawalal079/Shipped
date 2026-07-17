import React from 'react';

// Truncates email: lawalalhassan011@gmail.com → lawa…1@gmail.com
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 5) return email;
  return `${local.slice(0, 4)}\u2026${local.slice(-1)}@${domain}`;
}

export default function SettingsView({ address, user, balance, logout }) {
  const rawEmail = user?.email?.address || (typeof user?.email === 'string' ? user.email : 'Not Linked');
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto parchment-texture p-gutter text-ink-black rounded-sm border border-outline-variant space-y-8 my-6">
      <header className="border-b border-outline-variant pb-base">
        <span className="font-label-mono text-label-mono text-brand-muted uppercase block mb-1">
          System Config
        </span>
        <h2 className="font-display-lg text-headline-md text-ink-black">
          Ledger Settings
        </h2>
      </header>

      <div className="space-y-6">
        {/* Wallet Details */}
        <div className="space-y-2">
          <label className="font-label-mono text-[10px] text-brand-muted uppercase block">
            Wallet Address
          </label>
          <div className="flex items-center justify-between gap-2 bg-black/5 p-3 rounded-sm border border-outline-variant/35">
            <div className="font-mono text-xs text-ink-black truncate select-all flex-1" title={address}>
              {address || 'No wallet connected'}
            </div>
            {address && (
              <button
                onClick={handleCopy}
                className="font-label-mono text-[9px] uppercase text-brand-red border border-brand-red/35 px-2 py-0.5 hover:bg-brand-red hover:text-white transition-all flex-shrink-0"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          {/* Explorer link */}
          {address && (
            <a
              href={`https://testnet.monadexplorer.com/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label-mono text-[10px] text-brand-red hover:underline flex items-center gap-0.5 uppercase"
            >
              View on Explorer <span className="material-symbols-outlined text-[11px]">open_in_new</span>
            </a>
          )}
        </div>

        {/* Identity & Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/5 p-4 ledger-line">
            <span className="font-label-mono text-[10px] text-brand-muted uppercase block mb-1">
              Registered Email
            </span>
            <div className="font-mono text-sm text-ink-black truncate" title={rawEmail}>
              {maskEmail(rawEmail)}
            </div>
          </div>
          <div className="bg-black/5 p-4 ledger-line">
            <span className="font-label-mono text-[10px] text-brand-muted uppercase block mb-1">
              Native Balance
            </span>
            <div className="font-stamp-lg text-title-sm text-ink-black">
              {balance} MON
            </div>
          </div>
        </div>

        {/* Protocol Details — Chain ID removed (dev-only) */}
        <div className="border-t border-black/10 pt-6 space-y-4">
          <div className="flex justify-between items-center text-xs font-label-mono uppercase">
            <span className="text-brand-muted">Network</span>
            <span className="text-ink-black font-bold">Monad Testnet</span>
          </div>
          <div className="flex justify-between items-center text-xs font-label-mono uppercase">
            <span className="text-brand-muted">Status</span>
            <span className="text-brand-red font-bold">Verified Tracker Connection</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="https://faucet.monad.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow flex-1 bg-ink-black text-white text-center py-4 font-label-mono text-label-mono uppercase tracking-widest hover:bg-brand-red transition-all flex items-center justify-center gap-2"
          >
            Request Faucet Gas <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
          <button
            onClick={logout}
            className="flex-grow flex-1 border-2 border-brand-red text-brand-red py-4 font-label-mono text-label-mono uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all"
          >
            Deauthorize Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
