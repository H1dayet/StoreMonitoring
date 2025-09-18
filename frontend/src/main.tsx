import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './pages/App';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
