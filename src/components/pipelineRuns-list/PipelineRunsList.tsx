import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  VirtualizedTable,
  getGroupVersionKindForModel,
  useK8sWatchResource,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import * as React from 'react';
import usePipelineRunsColumns from './usePipelineRunsColumns';
import { usePipelineRunsFilters } from './usePipelineRunsFilters';
import { PipelineRunKind } from '../../types';
import { PipelineRunModel } from '../../models';
import { useGetTaskRuns } from '../hooks/useTektonResult';
import PipelineRunsRow from './PipelineRunsRow';

type PipelineRunsListProps = {
  namespace: string;
};

const PipelineRunsList: React.FC<PipelineRunsListProps> = ({ namespace }) => {
  const columns = usePipelineRunsColumns(namespace);
  const filters = usePipelineRunsFilters();
  const [pipelineRuns, pipelineRunsLoaded, pipelineRunsLoadError] =
    useK8sWatchResource<PipelineRunKind[]>({
      isList: true,
      groupVersionKind: getGroupVersionKindForModel(PipelineRunModel),
      namespace,
      optional: true,
    });
  const [data, filteredData, onFilterChange] = useListPageFilter(
    pipelineRuns,
    filters,
  );
  const [taskRuns] = useGetTaskRuns(namespace);
  return (
    <ListPageBody>
      <ListPageFilter
        columnLayout={{
          columns: columns?.map(({ id, title }) => ({ id, title })),
          id: 'pipelineRuns-list',
          type: 'PipelineRun',
          selectedColumns: new Set(['name']),
        }}
        rowFilters={filters}
        onFilterChange={onFilterChange}
        data={data}
        loaded={pipelineRunsLoaded}
        hideColumnManagement
      />
      <VirtualizedTable<K8sResourceCommon>
        EmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-templates-msg">
            No PipelineRuns found
          </div>
        )}
        columns={columns}
        data={filteredData}
        loaded={pipelineRunsLoaded}
        loadError={pipelineRunsLoadError}
        Row={PipelineRunsRow}
        rowData={{
          taskRuns,
        }}
        unfilteredData={data}
      />
    </ListPageBody>
  );
};

export default PipelineRunsList;
