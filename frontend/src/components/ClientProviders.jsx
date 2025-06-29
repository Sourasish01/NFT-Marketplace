"use client"; // This is correct and necessary for this component

import { Provider } from 'urql';
import Client from '../../lib/urqlClient'; // Import the client from the utility file
import { Toaster } from "react-hot-toast";

export default function ClientProviders({ children }) {
  return (
    // Pass the client to the Provider
    <Provider value={Client}>
      {children}
      <Toaster /> {/* Place Toaster inside the ClientProviders */}
    </Provider>
  );
}