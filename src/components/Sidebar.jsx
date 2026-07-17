import React from 'react';

// Truncates email: lawalalhassan011@gmail.com → lawa…1@gmail.com
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 5) return email; // too short to mask
  const head = local.slice(0, 4);
  const tail = local.slice(-1);
  return `${head}\u2026${tail}@${domain}`;
}

export default function Sidebar({ address, authenticated, onNewEntryClick, user, isOpen, onClose, activeTab = 'logbook', setActiveTab }) {
  // Truncated wallet address matching top-right header format
  const truncatedAddress = address 
    ? `${address.slice(0, 6)}…${address.slice(-4)}` 
    : 'Guest Tracker';

  // Retrieve the email address from the Privy user object if available
  const email = user?.email?.address || (typeof user?.email === 'string' ? user.email : null);

  // Bind display titles
  const displayTitle = authenticated ? truncatedAddress : 'Guest Tracker';
  const displaySubtitle = authenticated 
    ? (email ? maskEmail(email) : 'Verified Tracker') 
    : 'Unauthenticated';

  return (
    <>
      {/* Dimmed backdrop overlay for mobile/tablet when sidebar drawer is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 xl:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel container */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 border-r border-outline-variant py-8 px-6 bg-surface-container-lowest z-50 text-on-surface
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-stamp-lg text-stamp-lg text-on-surface tracking-widest uppercase">
            Shipped
          </h2>
          {/* Close button visible only below xl screens */}
          <button 
            onClick={onClose}
            className="xl:hidden text-on-surface-variant hover:text-on-surface p-1 focus:outline-none"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="space-y-4 flex-1">
          <a 
            className={`flex items-center gap-4 p-3 mx-[-8px] transition-all ${
              activeTab === 'logbook' 
                ? 'bg-primary-container text-on-primary-container rounded-lg font-bold' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (setActiveTab) setActiveTab('logbook');
              if (onClose) onClose();
            }}
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label-mono text-label-mono">Logbook</span>
          </a>
          <a 
            className={`flex items-center gap-4 p-3 mx-[-8px] transition-all ${
              activeTab === 'settings' 
                ? 'bg-primary-container text-on-primary-container rounded-lg font-bold' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (setActiveTab) setActiveTab('settings');
              if (onClose) onClose();
            }}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-mono text-label-mono">Settings</span>
          </a>
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-brass flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-ink-black">person</span>
            </div>
            <div className="overflow-hidden">
              <div className="font-title-sm text-[14px] text-on-surface truncate" title={address || ''}>
                {displayTitle}
              </div>
              <div className="font-label-mono text-[10px] text-on-surface-variant uppercase truncate" title={email || ''}>
                {displaySubtitle}
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (setActiveTab) setActiveTab('logbook'); // redirect back to logbook when spawning intent
              onNewEntryClick();
              if (onClose) onClose();
            }}
            className="w-full bg-brand-red text-white py-3 font-label-mono text-label-mono uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            New Entry
          </button>
        </div>
      </aside>
    </>
  );
}
