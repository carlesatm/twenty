import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { hasInitializedCurrentRecordFilterGroupsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFilterGroupsComponentFamilyState';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const ViewBarRecordFilterGroupEffect = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const contextStoreCurrentObjectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
  );

  const currentView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [
    hasInitializedCurrentRecordFilterGroups,
    setHasInitializedCurrentRecordFilterGroups,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentRecordFilterGroupsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFilterGroups = useSetRecoilComponentStateV2(
    currentRecordFilterGroupsComponentState,
  );

  useEffect(() => {
    if (isDefined(currentView) && !hasInitializedCurrentRecordFilterGroups) {
      if (
        currentView.objectMetadataId !==
        contextStoreCurrentObjectMetadataItem?.id
      ) {
        return;
      }

      if (isDefined(currentView)) {
        setCurrentRecordFilterGroups(
          mapViewFilterGroupsToRecordFilterGroups(
            currentView.viewFilterGroups ?? [],
          ),
        );

        setHasInitializedCurrentRecordFilterGroups(true);
      }
    }
  }, [
    currentViewId,
    setCurrentRecordFilterGroups,
    hasInitializedCurrentRecordFilterGroups,
    setHasInitializedCurrentRecordFilterGroups,
    contextStoreCurrentObjectMetadataItem?.id,
    currentView,
  ]);

  return null;
};
