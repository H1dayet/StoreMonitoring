import React from 'react';
import { getAuthUser } from '../services/auth';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select as CSelect,
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
} from '@chakra-ui/react';
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
    <TableContainer w="full" overflowX="auto">
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
                    <CSelect
                      size="sm"
                      width="36"
                      value={issue.status}
                      onChange={(e) => onStatusChange(issue.id, e.target.value as IssueStatus)}
                      variant="filled"
                      bg={c.bg}
                      color={c.color}
                      borderColor={c.border}
                      _hover={{ bg: c.bg }}
                      _focus={{ bg: c.bg, borderColor: c.border, boxShadow: '0 0 0 1px var(--chakra-colors-gray-400)' }}
                    >
                  <option value="open">open</option>
                  <option value="investigating">investigating</option>
                  <option value="closed">closed</option>
                </CSelect>
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
  );
};
