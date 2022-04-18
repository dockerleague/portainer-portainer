import { Column } from 'react-table';

import { isoDateFromTimestamp } from '@/portainer/filters/filters';
import type { DockerContainer } from '@/docker/containers/types';

export const created: Column<DockerContainer> = {
  Header: '创建时间',
  accessor: 'Created',
  id: 'created',
  Cell: ({ value }) => isoDateFromTimestamp(value),
  disableFilters: true,
  canHide: true,
  Filter: () => null,
};
