import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App.jsx';
import { monadTestnet } from './lib/chain.js';
import './index.css';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google'],
        // Embedded wallet is auto-created on login and signs silently —
        // showWalletUIs:false suppresses Privy's own confirm-transaction modal,
        // so checkIn() feels like a single tap with no popup in the way.
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: false,
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        appearance: {
          theme: 'dark',
          accentColor: '#B33F3F',
          logo: undefined,
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
