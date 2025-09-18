import React from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './pages/Root';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider theme={theme}>
  <Root />
  </ChakraProvider>
);
