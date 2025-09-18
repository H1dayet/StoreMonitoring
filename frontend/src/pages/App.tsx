import React, { useEffect, useState } from 'react';
// Removed IssueCards in favor of IssuesTable
import { IssuesTable } from '../components/IssuesTable';
import { fetchIssues, createIssue, updateIssueStatus, fetchStores, Store } from '../services/api';
import { Issue, IssueStatus, IssueReason } from '../types';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Select,
  SimpleGrid,
  Text,
  useColorMode,
  IconButton,
  Spacer,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stat,
  StatLabel,
  StatNumber,
  Textarea,
} from '@chakra-ui/react';
import { AddIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { getAuthUser } from '../services/auth';

export const App: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterStore, setFilterStore] = useState<string>('');
  const [filterReason, setFilterReason] = useState<IssueReason | ''>('');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');

  async function load() {
    setLoading(true);
    try {
      const data = await fetchIssues();
      setIssues(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    fetchStores().then(setStores).catch(() => setStores([]));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
  const reason = String(formData.get('reason') || '') as IssueReason;
  const storeCode = String(formData.get('storeCode') || '').trim();
  const description = String(formData.get('description') || '').trim();
  if (!reason) return;
    // Auto-generate a concise title using reason label and store code
    const title = `${reasonLabels[reason] || reason}${storeCode ? ` (${storeCode})` : ''}`;
  if (!storeCode) return;
  await createIssue({ title, description, reason, storeCode });
    form.reset();
    load();
  }

  async function handleStatusChange(id: string, status: IssueStatus) {
    await updateIssueStatus(id, status);
    load();
  }

  const reasonLabels: Record<IssueReason, string> = {
    'poss_kassa_siradan_cixdigi_zaman': 'POSS kassa sıradan çıxib',
    'nba_tokeni_siradan_cixdigi_zaman': 'NBA tokeni sıradan çıxib',
    'azsmart_tokeni_siradan_cixdigi_zaman': 'Azsmart tokeni sıradan çıxib',
    'encore_db_baglanti_problemi': 'Encore DB ilə bağlantı problemi',
    'internet_baglantisi_problemi': 'İnternet bağlantısındakı problem',
    'meraki_router_siradan_cixdigi_zaman': 'Meraki router sıradan çıxib',
    'elektrik_kesintisi': 'Elektrik kesintisi'
  };

  const bg = useColorModeValue('gray.50', 'gray.800');
  const panelBg = useColorModeValue('white', 'gray.900');
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Dashboard metrics
  const openCount = issues.filter(i => i.status === 'open').length;
  const inProgressCount = issues.filter(i => i.status === 'investigating').length;
  const activeCount = openCount + inProgressCount;

  const todayStart = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  const todayEnd = (() => { const d = new Date(); d.setHours(23,59,59,999); return d; })();

  const solvedToday = issues.filter(i => i.endedAt && new Date(i.endedAt) >= todayStart && new Date(i.endedAt) <= todayEnd);
  const solvedTodayCount = solvedToday.length;

  function formatDurationMs(ms: number) {
    if (!isFinite(ms) || ms <= 0) return '0s';
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    const remMinutes = minutes % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (remHours) parts.push(`${remHours}h`);
    parts.push(`${remMinutes}m`);
    return parts.join(' ');
  }

  // Average downtime today across tickets CREATED today (including ongoing)
  const now = Date.now();
  const todaysIssues = issues.filter(i => {
    const created = new Date(i.createdAt);
    return created >= todayStart && created <= todayEnd;
  });
  const todaysDurations = todaysIssues.map(i => {
    const createdMs = new Date(i.createdAt).getTime();
    const endedMs = i.endedAt ? new Date(i.endedAt).getTime() : now;
    return Math.max(0, endedMs - createdMs);
  });
  const avgDowntimeTodayMs = todaysDurations.length
    ? Math.round(todaysDurations.reduce((a,b)=>a+b,0) / todaysDurations.length)
    : 0;
  const avgDowntimeTodayLabel = formatDurationMs(avgDowntimeTodayMs);

  // Close modal after successful creation
  async function handleCreateAndClose(e: React.FormEvent<HTMLFormElement>) {
    await handleCreate(e);
    onClose();
  }

  const filteredIssues = issues.filter(i =>
    (!filterStore || i.storeCode === filterStore) &&
    (!filterReason || i.reason === filterReason) &&
    (!filterStatus || i.status === filterStatus)
  );

  function clearFilters() {
    setFilterStore('');
    setFilterReason('');
    setFilterStatus('');
  }

  const authUser = getAuthUser();
  const isAdmin = authUser?.role === 'admin';

  return (
    <Box minH="100vh" bg={bg} py={6}>
      <Container maxW="6xl">
        <HStack mb={6}>
          <Heading size="lg">Mağaza Dayanma Monitoru</Heading>
          <Spacer />
          <Button as="a" href="#/admin" variant="outline" mr={2}>Admin</Button>
          {isAdmin && (
          <Button colorScheme="teal" leftIcon={<AddIcon boxSize={3} />} onClick={onOpen} mr={2}>
            New Issue
          </Button>
          )}
          <IconButton
            aria-label="Toggle color mode"
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
          />
        </HStack>

        {loading && <Text mb={3}>Loading...</Text>}
        {/* Dashboard */}
        <Box bg={panelBg} p={4} rounded="md" shadow="sm" borderWidth="1px" mb={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Stat>
              <StatLabel>Active (Open + Investigating)</StatLabel>
              <StatNumber>{activeCount}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Solved today</StatLabel>
              <StatNumber>{solvedTodayCount}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Avg downtime today</StatLabel>
              <StatNumber>{avgDowntimeTodayLabel}</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Filters */}
        <Box bg={panelBg} p={3} rounded="md" shadow="sm" borderWidth="1px" mb={4}>
          <HStack gap={3} align="center">
            <Select placeholder="All stores" value={filterStore} onChange={(e) => setFilterStore(e.target.value)} maxW="280px">
              {stores.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </Select>
            <Select placeholder="All reasons" value={filterReason} onChange={(e) => setFilterReason(e.target.value as IssueReason)} maxW="320px">
              {Object.entries(reasonLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Select placeholder="All statuses" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as IssueStatus)} maxW="220px">
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="closed">Closed</option>
            </Select>
            <Spacer />
            <Button onClick={clearFilters} variant="ghost">Clear</Button>
          </HStack>
        </Box>

        {/* Issues Table */}
        <Box bg={panelBg} p={4} rounded="md" shadow="sm" borderWidth="1px">
          <IssuesTable
            issues={filteredIssues}
            onStatusChange={handleStatusChange}
            reasonLabels={reasonLabels}
            storeNameByCode={Object.fromEntries(stores.map(s => [s.code, s.name]))}
          />
        </Box>
      </Container>

      {/* Create Issue Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Issue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="create-issue-form" onSubmit={handleCreateAndClose}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <Select name="reason" placeholder="Select reason" isRequired>
                  {Object.entries(reasonLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
                <Select name="storeCode" placeholder="Select store" isRequired>
                  {stores.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                </Select>
              </SimpleGrid>
              <Box mt={3}>
                <Textarea name="description" placeholder="Add a short description (optional)" rows={4} />
              </Box>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button type="submit" form="create-issue-form" colorScheme="teal" leftIcon={<AddIcon boxSize={3} />}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

