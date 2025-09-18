import React, { useEffect, useState } from 'react';
import { Box, HStack, Text, Select, Stack, useColorModeValue, Badge, IconButton, Tooltip } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { deleteIssue } from '../services/api';
import { Issue, IssueStatus, IssueReason } from '../types';

type Props = {
  issues: Issue[];
  reasonLabels: Record<IssueReason, string>;
  onStatusChange?: (id: string, status: IssueStatus) => void;
  storeNameByCode?: Record<string, string>;
  onDeleted?: (id: string) => void;
};

const uiToApiStatus: Record<'open' | 'in progress' | 'closed', IssueStatus> = {
  'open': 'open',
  'in progress': 'investigating',
  'closed': 'closed',
};

function apiToUiStatus(status: IssueStatus): 'open' | 'in progress' | 'closed' {
  if (status === 'investigating') return 'in progress';
  if (status === 'closed') return 'closed';
  return 'open';
}

function formatDate(iso: string) {
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
  const parts = [] as string[];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!parts.length) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export const IssueCards: React.FC<Props> = ({ issues, reasonLabels, onStatusChange, storeNameByCode = {}, onDeleted }) => {
  const cardBg = useColorModeValue('white', 'gray.900');
  const border = useColorModeValue('gray.200', 'gray.700');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <Stack spacing={3}>
      {issues.map((issue) => {
        const uiStatus = apiToUiStatus(issue.status);
        const storeLabel = issue.storeCode
          ? `${storeNameByCode[issue.storeCode] || 'Unknown'} (${issue.storeCode})`
          : '-';
        return (
          <Box key={issue.id} bg={cardBg} borderWidth="1px" borderColor={border} rounded="md" p={3}>
            <HStack spacing={6} align="center" justify="space-between">
              <HStack spacing={6} align="center">
                <Field label="Store">
                  <Text>{storeLabel}</Text>
                </Field>
                <Field label="Reason">
                  <Text>{reasonLabels[issue.reason]}</Text>
                </Field>
                <Field label="Opened">
                  <Text>{formatDate(issue.createdAt)}</Text>
                </Field>
                <Field label="Downtime">
                  <Badge>{formatDuration(issue.createdAt, issue.endedAt)}</Badge>
                </Field>
              </HStack>
              <HStack>
                <Field label="Status">
                  {onStatusChange ? (
                    <Select
                      size="sm"
                      value={uiStatus}
                      onChange={(e) => onStatusChange(issue.id, uiToApiStatus[e.target.value as keyof typeof uiToApiStatus])}
                      width="44"
                    >
                      <option value="open">open</option>
                      <option value="in progress">in progress</option>
                      <option value="closed">closed</option>
                    </Select>
                  ) : (
                    <Text textTransform="capitalize">{uiStatus}</Text>
                  )}
                </Field>
                <Tooltip label="Delete issue">
                  <IconButton
                    aria-label="Delete issue"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await deleteIssue(issue.id);
                      onDeleted?.(issue.id);
                    }}
                  />
                </Tooltip>
              </HStack>
            </HStack>
          </Box>
        );
      })}
      {!issues.length && (
        <Text fontStyle="italic" color="gray.500">No issues</Text>
      )}
    </Stack>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Stack spacing={0} minW="170px">
    <Text fontSize="xs" color="gray.500">{label}</Text>
    <Box>{children}</Box>
  </Stack>
);

export default IssueCards;
