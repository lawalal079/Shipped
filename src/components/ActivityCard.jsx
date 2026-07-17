import React, { useState, useEffect } from 'react';

export function dayNumberToLabel(dayNumber) {
  if (!dayNumber || Number(dayNumber) === 0) return 'never';
  const ms = Number(dayNumber) * 86400 * 1000;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function isToday(dayNumber) {
  const today = Math.floor(Date.now() / 86400000);
  return Number(dayNumber) === today;
}

export function getActivityCategory(name) {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes('gym') ||
    lowerName.includes('run') ||
    lowerName.includes('work out') ||
    lowerName.includes('swim') ||
    lowerName.includes('exercise') ||
    lowerName.includes('sport') ||
    lowerName.includes('physical')
  ) {
    return 'Physical';
  }
  if (
    lowerName.includes('read') ||
    lowerName.includes('study') ||
    lowerName.includes('learn') ||
    lowerName.includes('code') ||
    lowerName.includes('write') ||
    lowerName.includes('ledger')
  ) {
    return 'Ledger';
  }
  if (
    lowerName.includes('guitar') ||
    lowerName.includes('piano') ||
    lowerName.includes('paint') ||
    lowerName.includes('draw') ||
    lowerName.includes('practice') ||
    lowerName.includes('music') ||
    lowerName.includes('creative')
  ) {
    return 'Creative';
  }
  return 'Intent';
}

export default function ActivityCard({ activity, index, onCheckIn, busy, checkingIn }) {
  const checkedInToday = isToday(activity.lastCheckInDay);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [cardScale, setCardScale] = useState('');

  // If the activity updates and checkedInToday becomes true, trigger stamp sound/bounce
  useEffect(() => {
    if (checkedInToday && justCheckedIn === false) {
      // If we clicked check-in ourselves, we animate it.
      // If it is just loaded, we don't animate.
    }
  }, [checkedInToday]);

  const handleCheckInClick = async () => {
    if (checkedInToday || busy) return;
    
    // Scale bounce effect (haptic simulation)
    setCardScale('scale-[0.98] translate-y-[2px]');
    setTimeout(() => setCardScale(''), 100);

    try {
      setJustCheckedIn(true);
      await onCheckIn(activity.id);
    } catch (e) {
      setJustCheckedIn(false);
      console.error(e);
    }
  };

  const category = getActivityCategory(activity.name);
  const indexStr = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`parchment-texture p-gutter relative overflow-hidden group hover-press transition-all duration-200 h-full ${cardScale}`}
      id={`habit-${activity.id}`}
    >
      {/* SHIPPED Stamp Overlay */}
      {checkedInToday && (
        <div
          className={`stamp-instance opacity-85 ${justCheckedIn ? 'stamp-animate' : ''}`}
          style={{ transform: 'translate(-50%, -50%) rotate(-12deg)' }}
        >
          SHIPPED
        </div>
      )}

      <div className="flex flex-col h-full space-y-6">
        <header className="border-b border-outline-variant pb-base">
          <span className="font-label-mono text-label-mono text-brand-muted uppercase block mb-1">
            {indexStr} / {category}
          </span>
          <h2 className="font-title-sm text-title-sm text-ink-black break-words leading-tight">
            {activity.name}
          </h2>
        </header>

        <div className="flex justify-between items-end py-base">
          <div className="flex flex-col">
            <span className="font-label-mono text-[11px] uppercase text-brand-muted mb-1">
              Current Streak
            </span>
            <span className="font-stamp-lg text-[48px] text-brand-red leading-none">
              {String(activity.currentStreak).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label-mono text-[11px] uppercase text-brand-muted mb-1">
              Hall of Fame
            </span>
            <span className="font-stamp-lg text-title-sm text-brand-brass">
              {String(activity.longestStreak).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-dashed border-outline-variant">
          <button
            onClick={handleCheckInClick}
            disabled={checkedInToday || busy || checkingIn}
            className={`w-full py-4 font-label-mono text-label-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              checkedInToday
                ? 'bg-brand-red/50 text-white border-transparent cursor-not-allowed'
                : checkingIn
                ? 'border-2 border-ink-black/40 text-ink-black/40 cursor-not-allowed'
                : 'border-2 border-ink-black text-ink-black hover:bg-ink-black hover:text-white active:scale-95'
            }`}
          >
            {checkingIn ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Confirming…
              </>
            ) : checkedInToday ? 'Checked In' : `Did you ${activity.name.toLowerCase()}?`}
          </button>
        </div>
      </div>
    </div>
  );
}
