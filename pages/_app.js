import '../styles/globals.css'
import { ApolloProvider } from "@apollo/client";
import { MetaMaskProvider } from "metamask-react";
import { useState, useEffect } from 'react'
import { makeClient } from "../apollo-client";
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  const [client, setClient] = useState(makeClient());

  const triggerClient = () => {
    setClient(makeClient())
  }

  return (
    <ApolloProvider client={client}>
      <MetaMaskProvider>
        <Footer triggerClient={triggerClient}></Footer>
        <Component {...pageProps} />
      </MetaMaskProvider>
    </ApolloProvider>
  )
}

export default MyApp
