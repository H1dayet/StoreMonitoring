import React, { useState } from 'react';
import { adminLogin } from '../services/api';
import { setToken, setAuthUser } from '../services/auth';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
  const { token, user } = await adminLogin(username.trim(), password);
  setToken(token);
  setAuthUser(user);
      // Trigger route change so Root re-evaluates auth
      window.location.hash = '#/';
    } catch (e: any) {
      toast({ status: 'error', title: 'Login failed', description: e.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxW="lg" py={12}>
      <Heading size="lg" mb={6}>Sign in</Heading>
      <Box borderWidth="1px" rounded="md" p={6}>
        <form onSubmit={onSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </FormControl>
            <Button type="submit" colorScheme="teal" isLoading={loading}>Login</Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
};
