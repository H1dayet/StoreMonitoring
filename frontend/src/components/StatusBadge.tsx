import React from 'react';
import { IssueStatus } from '../types';
import { Badge } from '@chakra-ui/react';

const colorScheme: Record<IssueStatus, string> = {
  open: 'red',
  investigating: 'orange',
  closed: 'green',
};

export const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => (
  <Badge colorScheme={colorScheme[status]} textTransform="uppercase" fontSize="0.7rem">
    {status}
  </Badge>
);
