import React, { useState, forwardRef } from 'react';

const NewActivityCard = forwardRef(({ onCreate, busy }, ref) => {
  const [name, setName] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    await onCreate(name.trim());
    setName('');
  };

  return (
    <form
      onSubmit={submit}
      className="border-2 border-dashed border-outline-variant bg-parchment/10 p-gutter group hover:bg-parchment/20 transition-all flex flex-col justify-center items-center h-full min-h-[340px] text-on-surface"
    >
      <div className="w-full max-w-xs space-y-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-outline-variant mb-4">
          <span className="material-symbols-outlined text-outline text-3xl">add</span>
        </div>
        <div className="space-y-4">
          <h3 className="font-display-lg text-title-sm text-on-surface">Manifest Intent</h3>
          <div className="relative">
            <input
              ref={ref}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              className="custom-input w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-brand-red text-center font-label-mono text-body-md py-4 uppercase text-on-surface focus:outline-none"
              placeholder="WHAT IS THE HABIT?"
              type="text"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="bg-on-surface text-surface w-full py-3 font-label-mono text-label-mono uppercase tracking-widest hover:bg-brand-red hover:text-white disabled:opacity-40 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Confirming&hellip;
              </>
            ) : 'Start Habit'}
          </button>
        </div>
      </div>
    </form>
  );
});

NewActivityCard.displayName = 'NewActivityCard';

export default NewActivityCard;
