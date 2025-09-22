import React, { useEffect, useMemo, useState } from 'react';
import { AdminUser, adminLogin, createUser, fetchUsers, createStore, deleteStoreApi } from '../services/api';
import { authHeaders, setToken as storeToken, clearToken as clearStoredToken, setAuthUser } from '../services/auth';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
} from '@chakra-ui/react';

export const Admin: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const toast = useToast();

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
  const { token, user } = await adminLogin(username.trim(), password);
  storeToken(token);
  setAuthUser(user);
      setToken(token);
      setUsername('');
      setPassword('');
      if (!window.location.hash.startsWith('#/admin')) window.location.hash = '#/admin';
    } catch (e: any) {
      toast({ status: 'error', title: 'Login failed', description: e.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const list = await fetchUsers();
      setUsers(list);
    } catch (e: any) {
      toast({ status: 'error', title: 'Failed to load users', description: e.message });
    }
  }

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  function logout() {
    clearStoredToken();
    setToken(null);
    window.location.hash = '#/login';
  }

  if (!token) {
    return (
      <Container maxW="lg" py={12}>
        <Heading size="lg" mb={6}>Admin Login</Heading>
        <Box borderWidth="1px" rounded="md" p={6}>
          <form onSubmit={doLogin}>
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
  }

  return (
    <Container maxW="6xl" py={8}>
      <HStack mb={6} justify="space-between">
        <Heading size="lg">Admin • Users</Heading>
        <HStack>
          <Button onClick={() => (window.location.hash = '#/')} variant="ghost">← Back</Button>
          <Button onClick={logout} variant="outline">Logout</Button>
        </HStack>
      </HStack>

  {/* Create User */}
      <CreateUserForm onCreated={loadUsers} />

  {/* Add/Delete Store */}
  <AddStoreForm />
  <DeleteStoreForm />

      {/* Users Table */}
      <Box borderWidth="1px" rounded="md" p={4} mt={6}>
        <Heading size="md" mb={3}>Existing Users</Heading>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Active</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(u => (
              <Tr key={u.id}>
                <Td>{u.username}</Td>
                <Td>{u.name}</Td>
                <Td>{u.role}</Td>
                <Td>{u.active ? 'Yes' : 'No'}</Td>
                <Td>{new Date(u.createdAt).toLocaleString()}</Td>
              </Tr>
            ))}
            {users.length === 0 && (
              <Tr>
                <Td colSpan={5}><Text>No users</Text></Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};

const CreateUserForm: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      await createUser({ username: username.trim(), name: name.trim(), password, role });
      setUsername(''); setName(''); setPassword(''); setRole('user');
      toast({ status: 'success', title: 'User created' });
      onCreated();
    } catch (e: any) {
      toast({ status: 'error', title: 'Failed to create user', description: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box borderWidth="1px" rounded="md" p={4}>
      <Heading size="md" mb={3}>Create User</Heading>
      <form onSubmit={submit}>
        <SimpleGrid columns={{ base: 1, md: 5 }} gap={3} alignItems="end">
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jdoe" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 6 chars" />
          </FormControl>
          <FormControl>
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'user')}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Select>
          </FormControl>
          <Button type="submit" colorScheme="teal" isLoading={loading}>Create</Button>
        </SimpleGrid>
      </form>
    </Box>
  );
};

const DeleteStoreForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const c = code.trim();
      if (!c) throw new Error('Store code is required');
      await deleteStoreApi(c);
      setCode('');
      toast({ status: 'success', title: 'Store deleted' });
    } catch (e: any) {
      toast({ status: 'error', title: 'Failed to delete store', description: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box borderWidth="1px" rounded="md" p={4} mt={4}>
      <Heading size="sm" mb={3}>Delete Store</Heading>
      <form onSubmit={submit}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} alignItems="end">
          <FormControl isRequired>
            <FormLabel>Store code</FormLabel>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 1601" />
          </FormControl>
          <Box />
          <Button type="submit" colorScheme="red" variant="outline" isLoading={loading}>Delete</Button>
        </SimpleGrid>
      </form>
    </Box>
  );
};

const AddStoreForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const c = code.trim();
      const n = name.trim();
      if (!c || !n) throw new Error('Code and name are required');
      await createStore({ code: c, name: n });
      setCode(''); setName('');
      toast({ status: 'success', title: 'Store added' });
    } catch (e: any) {
      toast({ status: 'error', title: 'Failed to add store', description: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box borderWidth="1px" rounded="md" p={4} mt={6}>
      <Heading size="md" mb={3}>Add Store</Heading>
      <form onSubmit={submit}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} alignItems="end">
          <FormControl isRequired>
            <FormLabel>Store code</FormLabel>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 1601" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Store name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. OBA-XYZ 1" />
          </FormControl>
          <Button type="submit" colorScheme="teal" isLoading={loading}>Add</Button>
        </SimpleGrid>
      </form>
    </Box>
  );
};
