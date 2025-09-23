import React from 'react';
import { getAuthUser } from '../services/auth';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  TableContainer,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { StatusBadge } from './StatusBadge';
import { Issue, IssueReason, IssueStatus } from '../types';

interface Props {
  issues: Issue[];
  onStatusChange?: (id: string, status: IssueStatus) => void;
  reasonLabels: Record<IssueReason, string>;
  storeNameByCode?: Record<string, string>;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatDuration(fromIso: string, toIso?: string) {
  const end = toIso ? new Date(toIso).getTime() : Date.now();
  const start = new Date(fromIso).getTime();
  let ms = Math.max(0, end - start);
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  ms -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(ms / (60 * 60 * 1000));
  ms -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(ms / (60 * 1000));
  ms -= minutes * 60 * 1000;
  const seconds = Math.floor(ms / 1000);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!parts.length) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export const IssuesTable: React.FC<Props> = ({ issues, onStatusChange, reasonLabels, storeNameByCode = {} }) => {
  const isAdmin = getAuthUser()?.role === 'admin';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeIssue, setActiveIssue] = React.useState<Issue | null>(null);
  function openDesc(issue: Issue) { setActiveIssue(issue); onOpen(); }

  // Top + bottom synchronized horizontal scrollbars
  const topRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const isSyncing = React.useRef(false);
  const [contentWidth, setContentWidth] = React.useState(0);
  React.useEffect(() => {
    const measure = () => {
      const el = bottomRef.current;
      if (!el) return;
      setContentWidth(el.scrollWidth);
      // Keep top scrollLeft aligned on relayout
      if (topRef.current) topRef.current.scrollLeft = el.scrollLeft;
    };
    const id = window.requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener('resize', measure);
    };
  }, [issues]);
  const onTopScroll = () => {
    if (isSyncing.current) return;
    const t = topRef.current, b = bottomRef.current;
    if (!t || !b) return;
    isSyncing.current = true;
    b.scrollLeft = t.scrollLeft;
    isSyncing.current = false;
  };
  const onBottomScroll = () => {
    if (isSyncing.current) return;
    const t = topRef.current, b = bottomRef.current;
    if (!t || !b) return;
    isSyncing.current = true;
    t.scrollLeft = b.scrollLeft;
    isSyncing.current = false;
  };

  const getSelectColors = (status: IssueStatus) => {
    if (status === 'open') {
      return {
        bg: useColorModeValue('red.100', 'red.600'),
        color: useColorModeValue('red.800', 'white'),
        border: useColorModeValue('red.300', 'red.500'),
      };
    }
    if (status === 'investigating') {
      return {
        bg: useColorModeValue('yellow.100', 'yellow.500'),
        color: useColorModeValue('yellow.800', 'black'),
        border: useColorModeValue('yellow.300', 'yellow.400'),
      };
    }
    return {
      bg: useColorModeValue('green.100', 'green.600'),
      color: useColorModeValue('green.800', 'white'),
      border: useColorModeValue('green.300', 'green.500'),
    };
  };
  return (
    <>
      {/* Top horizontal scrollbar */}
      <div ref={topRef} onScroll={onTopScroll} style={{ overflowX: 'auto', width: '100%', height: 12, marginBottom: 8 }} aria-hidden>
        <div style={{ width: contentWidth, height: 1 }} />
      </div>
      <TableContainer w="full" overflowX="auto" ref={bottomRef} onScroll={onBottomScroll}>
      <Table size="sm" variant="simple" width="full" sx={{ tableLayout: 'auto' }}>
      <Thead>
        <Tr>
          <Th minW="200px">Store</Th>
          <Th minW="240px">Reason</Th>
          <Th minW="180px">Opened by</Th>
          <Th minW="160px">Status</Th>
          <Th minW="140px">Downtime</Th>
          <Th minW="180px">Created</Th>
          <Th minW="120px">Details</Th>
        </Tr>
      </Thead>
      <Tbody>
        {issues.map((issue) => (
          <Tr key={issue.id}>
            <Td>
              {issue.storeCode ? `${storeNameByCode[issue.storeCode] || 'Unknown'} (${issue.storeCode})` : '-'}
            </Td>
            <Td>{reasonLabels[issue.reason]}</Td>
            <Td>
              <Text>{issue.createdByName || issue.createdByUsername || '-'}</Text>
            </Td>
            <Td>
              {onStatusChange && isAdmin ? (
                (() => {
                  const c = getSelectColors(issue.status);
                  return (
                    <Menu isLazy>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        size="sm"
                        variant="solid"
                        width="36"
                        bg={c.bg}
                        color={c.color}
                        borderColor={c.border}
                        _hover={{ bg: c.bg }}
                        _active={{ bg: c.bg }}
                      >
                        {issue.status === 'open' ? 'Open' : issue.status === 'investigating' ? 'Investigating' : 'Closed'}
                      </MenuButton>
                      <MenuList minW="160px">
                        <MenuItem onClick={() => onStatusChange(issue.id, 'open')}>Open</MenuItem>
                        <MenuItem onClick={() => onStatusChange(issue.id, 'investigating')}>Investigating</MenuItem>
                        <MenuItem onClick={() => onStatusChange(issue.id, 'closed')}>Closed</MenuItem>
                      </MenuList>
                    </Menu>
                  );
                })()
              ) : (
                <StatusBadge status={issue.status} />
              )}
            </Td>
            <Td><Text>{formatDuration(issue.createdAt, issue.endedAt)}</Text></Td>
            <Td><Text fontFamily="mono">{formatDateTime(issue.createdAt)}</Text></Td>
            <Td>
              <Button size="sm" variant="outline" onClick={() => openDesc(issue)}>View</Button>
            </Td>
          </Tr>
        ))}
        {!issues.length && (
          <Tr>
            <Td colSpan={7}>No issues</Td>
          </Tr>
        )}
      </Tbody>
    </Table>

    {/* Description Modal */}
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Issue Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {activeIssue ? (
            <>
              <Text fontWeight="bold" mb={2}>{reasonLabels[activeIssue.reason]}</Text>
              <Text fontSize="sm" color="gray.500" mb={3}>{formatDateTime(activeIssue.createdAt)}</Text>
              <Text whiteSpace="pre-wrap">{activeIssue.description || 'No description provided.'}</Text>
            </>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
    </TableContainer>
    </>
  );
};
