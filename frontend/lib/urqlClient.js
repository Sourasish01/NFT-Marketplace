

// frontend/src/lib/urqlClient.js
import { createClient, cacheExchange, fetchExchange } from 'urql';
import { ssrExchange } from '@urql/next'; // Make sure you have @urql/next installed

// This will hold the data from the server-side render
// It needs to be mutable because we'll assign to it on the client
let ssr;

// Check if we are on the server side
const isServerSide = typeof window === 'undefined';

// If on the server, create a fresh ssrExchange for this request.
// If on the client, create an ssrExchange and restore data.
if (isServerSide) {
  ssr = ssrExchange({
    is: true,
    // Initial data is empty on the server, it will be populated by server fetches
  });
} else {
  // On the client, create the ssrExchange and restore data that was
  // passed from the server. This prevents re-fetching data already loaded.
  // The global window.__URQL_DATA__ is where Next.js typically puts it.
  ssr = ssrExchange({
    is: false,
    data: window.__URQL_DATA__ // Restore data from the global object
  });
}

const Client = createClient({
  url: 'https://api.studio.thegraph.com/query/114466/nft-marketplace/version/latest',
  // Order matters: ssr should be before fetchExchange to rehydrate/extract data
  exchanges: [cacheExchange, ssr, fetchExchange],
});

export default Client;











/*
// lib/urqlClient.js
// NO "use client" directive here. This is a utility file, not a React component.

import { createClient } from 'urql';

let client = null; // Initialize client as null

// Only create the URQL client if we are in a browser environment (client-side).
// This prevents issues when Next.js tries to execute this code on the server during SSR.
if (typeof window !== 'undefined') {
  client = createClient({
    url: 'https://api.studio.thegraph.com/query/114466/nft-marketplace/version/latest',
    // If you have exchanges, include them here, for example:
    // exchanges: [cacheExchange, fetchExchange], // Make sure to import these if used
  });
}

export default client

*/