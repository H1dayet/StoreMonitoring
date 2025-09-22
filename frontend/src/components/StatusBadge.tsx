import React from 'react';
import { Badge } from '@chakra-ui/react';
import { IssueStatus } from '../types';

const colorScheme: Record<IssueStatus, string> = {
  open: 'red',
  investigating: 'yellow',
  closed: 'green',
};

export const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => (
  <Badge colorScheme={colorScheme[status]} textTransform="uppercase" fontSize="0.7rem">
    {status}
  </Badge>
);
