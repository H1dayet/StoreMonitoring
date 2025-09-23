import React, { useEffect, useMemo, useState, useDeferredValue } from 'react';
// Removed IssueCards in favor of IssuesTable
import { IssuesTable } from '../components/IssuesTable';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { AddIcon, MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { getAuthUser, clearToken } from '../services/auth';
import { Issue, IssueReason, IssueStatus } from '../types';
import { createIssue, fetchIssues, fetchStores, Store, updateIssueStatus } from '../services/api';

export const App: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterStore, setFilterStore] = useState<string>('');
  const [filterReason, setFilterReason] = useState<IssueReason | ''>('');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | ''>('');
  const [storeQuery, setStoreQuery] = useState<string>('');
  const [newIssueStoreCode, setNewIssueStoreCode] = useState<string>('');
  const [newIssueStoreQuery, setNewIssueStoreQuery] = useState<string>('');
  const [newIssueReason, setNewIssueReason] = useState<IssueReason | ''>('');
  const deferredNewIssueQuery = useDeferredValue(newIssueStoreQuery);
  const filteredNewIssueStores = useMemo(() => {
    const q = deferredNewIssueQuery.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [stores, deferredNewIssueQuery]);
  const deferredStoreQuery = useDeferredValue(storeQuery);
  const filteredStores = useMemo(() => {
    const q = deferredStoreQuery.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [stores, deferredStoreQuery]);
  // Time range filter with presets and optional custom date range (day precision)
  type RangeKey = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';
  const [rangeKey, setRangeKey] = useState<RangeKey>('all'); // default: no time filter
  const [filterStart, setFilterStart] = useState<string>(''); // YYYY-MM-DD
  const [filterEnd, setFilterEnd] = useState<string>('');     // YYYY-MM-DD

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

  async function handleCreate(e: React.FormEvent<HTMLFormElement>): Promise<boolean> {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
  const reason = String(formData.get('reason') || '') as IssueReason;
  const storeCode = (newIssueStoreCode || String(formData.get('storeCode') || '')).trim();
  const description = String(formData.get('description') || '').trim();
  if (!reason) return false;
    // Auto-generate a concise title using reason label and store code
    const title = `${reasonLabels[reason] || reason}${storeCode ? ` (${storeCode})` : ''}`;
  if (!storeCode) return false;
  await createIssue({ title, description, reason, storeCode });
    form.reset();
    setNewIssueStoreCode('');
    setNewIssueStoreQuery('');
    setNewIssueReason('');
    load();
    return true;
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

  const bg = useColorModeValue('#3aa0e6', 'gray.800');
  const panelBg = useColorModeValue('white', 'gray.900');
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rangeLabel = (key: RangeKey) => (
    key === 'all' ? 'All time' :
    key === 'today' ? 'Today' :
    key === 'last7' ? 'Last 7 days' :
    key === 'last30' ? 'Last 30 days' :
    key === 'thisMonth' ? 'This month' :
    key === 'lastMonth' ? 'Last month' :
    'Custom…'
  );

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

  // Helpers for date-only parsing and range building
  function parseDateOnly(s: string | undefined): Date | undefined {
    if (!s) return undefined;
    const [y, m, d] = s.split('-').map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d, 0, 0, 0, 0); // local timezone start of day
  }

  function endOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  function getPresetRange(key: RangeKey): { start?: Date; end?: Date } {
    const nowD = new Date();
    const startToday = new Date(nowD); startToday.setHours(0,0,0,0);
    const endToday = new Date(nowD); endToday.setHours(23,59,59,999);
    if (key === 'today') return { start: startToday, end: endToday };
    if (key === 'last7') {
      const start = new Date(startToday); start.setDate(start.getDate() - 6);
      return { start, end: endToday };
    }
    if (key === 'last30') {
      const start = new Date(startToday); start.setDate(start.getDate() - 29);
      return { start, end: endToday };
    }
    if (key === 'thisMonth') {
      const start = new Date(nowD.getFullYear(), nowD.getMonth(), 1, 0, 0, 0, 0);
      return { start, end: endToday };
    }
    if (key === 'lastMonth') {
      const start = new Date(nowD.getFullYear(), nowD.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(nowD.getFullYear(), nowD.getMonth(), 0, 23, 59, 59, 999); // last day prev month
      return { start, end };
    }
    return { }; // 'all' or 'custom' handled separately
  }

  // Build active range for filtering (table + avg when active)
  const now = Date.now();
  const customStart = parseDateOnly(filterStart);
  const customEnd = filterEnd ? endOfDay(parseDateOnly(filterEnd)!) : undefined;
  const preset = getPresetRange(rangeKey);
  const hasCustomBounds = !!(customStart || customEnd);
  const timeFilterActive = rangeKey !== 'all' && (rangeKey !== 'custom' || hasCustomBounds);
  const rangeStart = rangeKey === 'custom' ? (customStart ?? undefined) : (preset.start ?? undefined);
  const rangeEnd = rangeKey === 'custom' ? (customEnd ?? undefined) : (preset.end ?? undefined);

  // If no time filter is active, total downtime defaults to today
  const avgRangeStart = timeFilterActive ? (rangeStart ?? new Date(0)) : todayStart;
  const avgRangeEnd = timeFilterActive ? (rangeEnd ?? new Date()) : todayEnd;

  const rangeIssues = issues.filter(i => {
    const created = new Date(i.createdAt);
    const afterStart = !avgRangeStart || created >= avgRangeStart;
    const beforeEnd = !avgRangeEnd || created <= avgRangeEnd;
    return afterStart && beforeEnd;
  });
  const rangeDurations = rangeIssues.map(i => {
    const createdMs = new Date(i.createdAt).getTime();
    const endedMs = i.endedAt ? new Date(i.endedAt).getTime() : now;
    return Math.max(0, endedMs - createdMs);
  });
  const totalDowntimeMs = rangeDurations.length
    ? rangeDurations.reduce((a,b)=>a+b,0)
    : 0;
  const totalDowntimeLabel = formatDurationMs(totalDowntimeMs);

  // Close modal after successful creation
  async function handleCreateAndClose(e: React.FormEvent<HTMLFormElement>) {
    const ok = await handleCreate(e);
    if (ok) onClose();
  }

  const filteredIssues = issues.filter(i => {
    const created = new Date(i.createdAt);
    const withinStart = !timeFilterActive || !rangeStart || created >= rangeStart;
    const withinEnd = !timeFilterActive || !rangeEnd || created <= rangeEnd;
    return (
      (!filterStore || i.storeCode === filterStore) &&
      (!filterReason || i.reason === filterReason) &&
      (!filterStatus || i.status === filterStatus) &&
      withinStart && withinEnd
    );
  });

  function clearFilters() {
    setFilterStore('');
    setFilterReason('');
    setFilterStatus('');
  setStoreQuery('');
  setRangeKey('all');
  setFilterStart('');
  setFilterEnd('');
  }

  const authUser = getAuthUser();
  const isAdmin = authUser?.role === 'admin';

  return (
    <Box minH="100vh" bg={bg} py={6}>
      <Container maxW="6xl">
        <HStack mb={6}>
          <Heading size="lg">Mağaza Dayanma Monitoru</Heading>
          <Spacer />
          {isAdmin && (
          <Button
            as="a"
            href="#/admin"
            colorScheme="blue"
            variant={colorMode === 'light' ? 'solid' : 'outline'}
            mr={2}
          >
            Admin
          </Button>
          )}
          {isAdmin && (
          <Button colorScheme="teal" leftIcon={<AddIcon boxSize={3} />} onClick={onOpen} mr={2}>
            New Issue
          </Button>
          )}
          <Button
            onClick={() => clearToken()}
            colorScheme="red"
            variant={colorMode === 'light' ? 'solid' : 'outline'}
            mr={2}
          >
            Logout
          </Button>
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
              <StatLabel>{timeFilterActive ? 'Total downtime (filtered)' : 'Total downtime today'}</StatLabel>
              <StatNumber>{totalDowntimeLabel}</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Filters */}
        <Box bg={panelBg} p={3} rounded="md" shadow="sm" borderWidth="1px" mb={4}>
          <HStack gap={3} align="center" flexWrap="wrap">
            {/* Store dropdown with embedded search */}
            <Menu isLazy>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" maxW="280px">
                {(() => {
                  const sel = stores.find(s => s.code === filterStore);
                  return sel ? `${sel.code} - ${sel.name}` : 'All stores';
                })()}
              </MenuButton>
              <MenuList minW="280px" p={0}>
                <Box p={2} borderBottomWidth="1px">
                  <Input
                    placeholder="Search stores..."
                    size="sm"
                    value={storeQuery}
                    onChange={(e) => setStoreQuery(e.target.value)}
                  />
                </Box>
                <MenuItem onClick={() => { setFilterStore(''); }}>All stores</MenuItem>
                <Box maxH="260px" overflowY="auto">
                  {filteredStores
                    .slice(0, 200)
                    .map(s => (
                      <MenuItem key={s.code} onClick={() => { setFilterStore(s.code); }}>
                        {s.code} - {s.name}
                      </MenuItem>
                    ))}
                  {filteredStores.length > 200 && (
                    <Text px={3} py={2} fontSize="xs" color="gray.500">Showing first 200 of {filteredStores.length} results… Refine your search.</Text>
                  )}
                </Box>
              </MenuList>
            </Menu>
            <Menu isLazy>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" maxW="280px">
                {filterReason ? reasonLabels[filterReason] : 'All reasons'}
              </MenuButton>
              <MenuList minW="280px">
                <MenuItem onClick={() => setFilterReason('' as any)}>All reasons</MenuItem>
                {Object.entries(reasonLabels).map(([key, label]) => (
                  <MenuItem key={key} onClick={() => setFilterReason(key as IssueReason)}>{label}</MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Menu isLazy>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" maxW="200px">
                {filterStatus ? (filterStatus === 'open' ? 'Open' : filterStatus === 'investigating' ? 'Investigating' : 'Closed') : 'All statuses'}
              </MenuButton>
              <MenuList minW="140px">
                <MenuItem onClick={() => setFilterStatus('' as any)}>All statuses</MenuItem>
                <MenuItem onClick={() => setFilterStatus('open')}>Open</MenuItem>
                <MenuItem onClick={() => setFilterStatus('investigating')}>Investigating</MenuItem>
                <MenuItem onClick={() => setFilterStatus('closed')}>Closed</MenuItem>
              </MenuList>
            </Menu>
            {/* Time range filter */}
            <HStack gap={2} align="flex-end">
              <Menu isLazy>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" minW="120px">
                  {rangeLabel(rangeKey)}
                </MenuButton>
                <MenuList minW="140px">
                  <MenuItem onClick={() => setRangeKey('all')}>All time</MenuItem>
                  <MenuItem onClick={() => setRangeKey('today')}>Today</MenuItem>
                  <MenuItem onClick={() => setRangeKey('last7')}>Last 7 days</MenuItem>
                  <MenuItem onClick={() => setRangeKey('last30')}>Last 30 days</MenuItem>
                  <MenuItem onClick={() => setRangeKey('thisMonth')}>This month</MenuItem>
                  <MenuItem onClick={() => setRangeKey('lastMonth')}>Last month</MenuItem>
                  <MenuItem onClick={() => setRangeKey('custom')}>Custom…</MenuItem>
                </MenuList>
              </Menu>
              {rangeKey === 'custom' && (
                <HStack gap={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Start date</Text>
                    <input
                      type="date"
                      value={filterStart}
                      onChange={(e) => setFilterStart(e.target.value)}
                      style={{ padding: '6px', border: '1px solid var(--chakra-colors-gray-200)', borderRadius: 6 }}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>End date</Text>
                    <input
                      type="date"
                      value={filterEnd}
                      onChange={(e) => setFilterEnd(e.target.value)}
                      style={{ padding: '6px', border: '1px solid var(--chakra-colors-gray-200)', borderRadius: 6 }}
                    />
                  </Box>
                </HStack>
              )}
            </HStack>
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
                {/* Reason dropdown matching All stores style */}
                <Box>
                  <input type="hidden" name="reason" value={newIssueReason} />
                  <Menu isLazy>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" width="100%">
                      {newIssueReason ? reasonLabels[newIssueReason] : 'Select reason'}
                    </MenuButton>
                    <MenuList minW="280px">
                      {Object.entries(reasonLabels).map(([key, label]) => (
                        <MenuItem key={key} onClick={() => setNewIssueReason(key as IssueReason)}>{label}</MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </Box>
                {/* Store dropdown with embedded search for new issue */}
                <Box>
                  <input type="hidden" name="storeCode" value={newIssueStoreCode} />
                  <Menu isLazy>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" width="100%">
                      {(() => {
                        const sel = stores.find(s => s.code === newIssueStoreCode);
                        return sel ? `${sel.code} - ${sel.name}` : 'Select store';
                      })()}
                    </MenuButton>
                    <MenuList minW="280px" p={0}>
                      <Box p={2} borderBottomWidth="1px">
                        <Input
                          placeholder="Search stores..."
                          size="sm"
                          value={newIssueStoreQuery}
                          onChange={(e) => setNewIssueStoreQuery(e.target.value)}
                        />
                      </Box>
                      <Box maxH="260px" overflowY="auto">
                        {filteredNewIssueStores.slice(0, 200).map(s => (
                          <MenuItem key={s.code} onClick={() => { setNewIssueStoreCode(s.code); }}>
                            {s.code} - {s.name}
                          </MenuItem>
                        ))}
                        {filteredNewIssueStores.length > 200 && (
                          <Text px={3} py={2} fontSize="xs" color="gray.500">Showing first 200 of {filteredNewIssueStores.length} results… Refine your search.</Text>
                        )}
                      </Box>
                    </MenuList>
                  </Menu>
                </Box>
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

