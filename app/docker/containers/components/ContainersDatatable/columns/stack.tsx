import { Column } from 'react-table';

import type { DockerContainer } from '@/docker/containers/types';

export const stack: Column<DockerContainer> = {
  Header: '堆栈',
  accessor: (row) => row.StackName || '-',
  id: 'stack',
  sortType: 'string',
  disableFilters: true,
  canHide: true,
  Filter: () => null,
};
