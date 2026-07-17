import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { monadTestnet } from './lib/chain.js';
import { SHIPPED_ABI, SHIPPED_CONTRACT_ADDRESS } from './lib/contractConfig.js';

// Components
import Sidebar from './components/Sidebar';
import ActivityCard from './components/ActivityCard';
import NewActivityCard from './components/NewActivityCard';
import PassportPanel from './components/PassportPanel';
import SettingsView from './components/SettingsView';

function parseContractError(err) {
  const errMsg = err.message || String(err);
  if (errMsg.includes('insufficient funds')) {
    return 'Insufficient MON for gas. Please fund your wallet using the faucet.';
  }
  if (errMsg.includes('AlreadyCheckedInToday')) {
    return 'Already checked in for this habit today.';
  }
  if (errMsg.includes('UserRejectedRequestError') || errMsg.includes('rejected')) {
    return 'Transaction signature rejected by user.';
  }
  
  const match = errMsg.match(/revert reason:\s*(.+)/i) || errMsg.match(/Reason:\s*(.+)/i);
  if (match && match[1]) {
    return match[1].split('\n')[0];
  }
  return errMsg.split('\n')[0] || 'Unknown transaction failure.';
}

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

export default function App() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  // Set of activity IDs currently being checked in — drives per-card pending state
  const [checkingInIds, setCheckingInIds] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [balance, setBalance] = useState('0.0000');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('logbook');

  // Reference for focusing and scrolling to the "Manifest Intent" input
  const newActivityInputRef = useRef(null);

  const embeddedWallet = useMemo(
    () => wallets.find((w) => w.walletClientType === 'privy'),
    [wallets]
  );
  const address = embeddedWallet?.address;

  // Log embedded wallet connection status and chain ID after login to verify
  useEffect(() => {
    if (authenticated && embeddedWallet) {
      console.log('Embedded wallet connected. Address:', embeddedWallet.address, 'ChainID:', embeddedWallet.chainId);
    }
  }, [authenticated, embeddedWallet]);

  const getWalletClient = useCallback(async () => {
    if (!embeddedWallet) return null;
    try {
      // Force switch to Monad testnet chain before writing
      await embeddedWallet.switchChain(10143);
    } catch (e) {
      console.error('Failed to switch chain to Monad testnet', e);
    }
    const provider = await embeddedWallet.getEthereumProvider();
    return createWalletClient({
      chain: monadTestnet,
      transport: custom(provider),
      account: embeddedWallet.address,
    });
  }, [embeddedWallet]);

  const loadBalance = useCallback(async () => {
    if (!address) return;
    try {
      const balWei = await publicClient.getBalance({ address });
      const balEth = Number(balWei) / 1e18;
      setBalance(balEth.toFixed(4));
    } catch (err) {
      console.error('Failed to load balance', err);
    }
  }, [address]);

  const loadActivities = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const ids = await publicClient.readContract({
        address: SHIPPED_CONTRACT_ADDRESS,
        abi: SHIPPED_ABI,
        functionName: 'getUserActivityIds',
        args: [address],
      });

      const details = await Promise.all(
        ids.map(async (id) => {
          const [name, lastCheckInDay, currentStreak, longestStreak, totalCheckIns] =
            await publicClient.readContract({
              address: SHIPPED_CONTRACT_ADDRESS,
              abi: SHIPPED_ABI,
              functionName: 'getActivity',
              args: [address, id],
            });
          return { id, name, lastCheckInDay, currentStreak, longestStreak, totalCheckIns };
        })
      );

      setActivities(details);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (authenticated && address) {
      loadActivities();
      loadBalance();
    }
  }, [authenticated, address, loadActivities, loadBalance]);

  const handleCreate = async (name) => {
    setError(null);
    const walletClient = await getWalletClient();
    if (!walletClient) {
      setError('Wallet client not available.');
      return;
    }
    setBusy(true);
    try {
      const hash = await walletClient.writeContract({
        address: SHIPPED_CONTRACT_ADDRESS,
        abi: SHIPPED_ABI,
        functionName: 'createActivity',
        args: [name],
        gas: 300000n, // Override gas estimation for RPCs failing silently
      });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Poll getUserActivityIds until the length is updated or timeout (5 retries) to fix node propagation lag
      const expectedLength = activities.length + 1;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const updatedIds = await publicClient.readContract({
            address: SHIPPED_CONTRACT_ADDRESS,
            abi: SHIPPED_ABI,
            functionName: 'getUserActivityIds',
            args: [address],
          });
          if (updatedIds.length >= expectedLength) {
            break;
          }
        } catch (e) {
          console.warn('Polling getUserActivityIds failed', e);
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      await loadActivities();
      await loadBalance();
    } catch (err) {
      console.error('createActivity failed. Full error object:', err);
      console.dir(err);
      setError(parseContractError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCheckIn = async (activityId) => {
    setError(null);
    const walletClient = await getWalletClient();
    if (!walletClient) {
      setError('Wallet client not available.');
      return;
    }
    // Mark this specific card as pending
    setCheckingInIds(prev => new Set(prev).add(activityId));
    setBusy(true);
    try {
      const hash = await walletClient.writeContract({
        address: SHIPPED_CONTRACT_ADDRESS,
        abi: SHIPPED_ABI,
        functionName: 'checkIn',
        args: [activityId],
        gas: 300000n,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await loadActivities();
      await loadBalance();
    } catch (err) {
      console.error('checkIn failed. Full error object:', err);
      console.dir(err);
      setError(parseContractError(err));
      throw err; // rethrow so ActivityCard can reset its local optimistic state
    } finally {
      setCheckingInIds(prev => { const next = new Set(prev); next.delete(activityId); return next; });
      setBusy(false);
    }
  };

  // Scroll to and focus the "Manifest Intent" input field
  const handleNewEntryClick = () => {
    if (newActivityInputRef.current) {
      newActivityInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newActivityInputRef.current.focus();
    }
  };

  return (
    <div className="desk-surface min-h-screen text-on-surface selection:bg-brand-red selection:text-white flex">
      <div className="grain" />

      {/* Side Navigation (Desktop Fixed, Mobile Collapsible Drawer) */}
      <Sidebar
        address={address}
        authenticated={authenticated}
        onNewEntryClick={authenticated ? handleNewEntryClick : login}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Area */}
      <div className="xl:pl-64 flex-grow flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="bg-transparent flex justify-between items-center w-full px-container-padding py-base max-w-[1200px] mx-auto z-50">
          <div className="flex items-center gap-4">
            {/* Hamburger Button for Mobile/Tablet */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden text-on-surface-variant hover:text-primary p-1 border border-outline-variant hover:border-primary flex items-center justify-center"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-stamp-lg text-stamp-lg text-primary tracking-widest uppercase">
                Shipped
              </h1>
              <p className="font-label-mono text-[10px] text-on-surface-variant uppercase mt-1 tracking-tighter">
                Daily proof of work, stamped onchain
              </p>
            </div>
          </div>
          <div className="flex items-center gap-base">
            {ready && (
              authenticated ? (
                <div className="flex items-center gap-4">
                  <span className="font-label-mono text-label-mono text-on-surface-variant hidden sm:inline">
                    {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''}
                  </span>
                  <button
                    onClick={logout}
                    className="font-label-mono text-label-mono text-brand-red hover:underline uppercase tracking-wide px-3 py-1 border border-brand-red/35 hover:border-brand-red transition-all"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="font-label-mono text-label-mono text-on-surface-variant hover:text-primary transition-colors duration-200 px-4 py-2 border border-outline-variant hover:border-primary"
                >
                  Sign In
                </button>
              )
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-[1200px] mx-auto px-container-padding py-section-margin flex-grow w-full">
          {error && (
            <div className="mb-6 p-4 border border-brand-red bg-brand-red/10 text-brand-red font-label-mono text-sm uppercase relative overflow-hidden flex justify-between items-center rounded-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-red text-xl">warning</span>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-brand-red hover:text-white transition-colors focus:outline-none flex items-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {!authenticated ? (
            /* Unauthenticated Explorer Desk Overlay */
            <div className="max-w-md mx-auto parchment-texture p-gutter text-center space-y-8 my-12 rounded-sm border border-outline-variant relative overflow-hidden">
              <div className="space-y-4">
                <span className="font-label-mono text-[11px] text-brand-red uppercase block tracking-wider">
                  Monad Testnet Ledger
                </span>
                <h2 className="font-display-lg text-headline-md text-ink-black border-b border-outline-variant pb-base">
                  Habit Ledger
                </h2>
                <p className="font-body-md text-ink-black/75 leading-relaxed">
                  Every check-in is stamped permanently onchain. Initialize your personal habit ledger today.
                </p>
              </div>

              <button
                onClick={login}
                className="w-full bg-brand-red text-white py-4 font-label-mono text-label-mono uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Initialize Ledger
              </button>

              <p className="font-label-mono text-[10px] text-on-surface-variant uppercase pt-2">
                No browser extension or gas required.
              </p>
            </div>
          ) : loading ? (
            /* Loading State styled matching the ledger typography */
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
              <p className="font-label-mono text-sm text-on-surface-variant uppercase tracking-widest">
                Reading ledger entries from chain...
              </p>
            </div>
          ) : activeTab === 'settings' ? (
            <SettingsView
              address={address}
              user={user}
              balance={balance}
              logout={logout}
            />
          ) : (
            <div className="space-y-gutter">
              {/* Passport Panel Summary in its own clearly separated section */}
              <PassportPanel
                activities={activities}
                address={address}
                balance={balance}
                onRefreshBalance={loadBalance}
              />

              {/* Main Dashboard Grid with equal-height stretch alignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter items-stretch">
                {activities.map((activity, index) => (
                  <ActivityCard
                    key={String(activity.id)}
                    activity={activity}
                    index={index}
                    onCheckIn={handleCheckIn}
                    busy={busy}
                    checkingIn={checkingInIds.has(activity.id)}
                  />
                ))}

                {/* Start a Habit Entry Card */}
                <NewActivityCard
                  ref={newActivityInputRef}
                  onCreate={handleCreate}
                  busy={busy}
                />
              </div>
            </div>
          )}
        </main>

        {/* Footer Component */}
        <footer className="w-full py-section-margin border-t border-outline-variant opacity-30 mt-auto">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center px-container-padding">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant text-xs">
              © 1924 Shipped Habit Ledger. All entries are permanent.
            </span>
            <nav className="flex gap-gutter mt-4 md:mt-0">
              <a
                className="font-label-mono text-label-mono uppercase text-on-surface-variant hover:text-on-surface underline text-xs"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Manifesto
              </a>
              <a
                className="font-label-mono text-label-mono uppercase text-on-surface-variant hover:text-on-surface underline text-xs"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Protocol
              </a>
              <a
                className="font-label-mono text-label-mono uppercase text-on-surface-variant hover:text-on-surface underline text-xs"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Support
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
