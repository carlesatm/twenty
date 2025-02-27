import { useEffect } from 'react';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { objectRecordMultiSelectComponentFamilyState } from '@/object-record/multiple-objects/multiple-objects-picker/states/multipleObjectsPickerIsSelectedComponentFamilyState';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/multiple-objects/multiple-objects-picker/states/multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { SelectedObjectRecordId } from '@/object-record/types/SelectedObjectRecordId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// Todo: this effect should be deprecated to use sync hooks
export const ActivityTargetInlineCellEditModeMultiRecordsEffect = ({
  recordPickerInstanceId,
  selectedObjectRecordIds,
}: {
  recordPickerInstanceId: string;
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
    recordPickerInstanceId,
  );
  const {
    objectRecordsIdsMultiSelectState,
    objectRecordMultiSelectCheckedRecordsIdsState,
  } = useObjectRecordMultiSelectScopedStates(instanceId);
  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilState(objectRecordsIdsMultiSelectState);

  const setObjectRecordMultiSelectCheckedRecordsIds = useSetRecoilState(
    objectRecordMultiSelectCheckedRecordsIdsState,
  );

  const updateRecords = useRecoilCallback(
    ({ snapshot, set }) =>
      (newRecords: ObjectRecordForSelect[]) => {
        for (const newRecord of newRecords) {
          const currentRecord = snapshot
            .getLoadable(
              objectRecordMultiSelectComponentFamilyState({
                scopeId: instanceId,
                familyKey: newRecord.record.id,
              }),
            )
            .getValue();

          const objectRecordMultiSelectCheckedRecordsIds = snapshot
            .getLoadable(objectRecordMultiSelectCheckedRecordsIdsState)
            .getValue();

          const newRecordWithSelected = {
            ...newRecord,
            selected: objectRecordMultiSelectCheckedRecordsIds.some(
              (checkedRecordId) => checkedRecordId === newRecord.record.id,
            ),
          };

          if (
            !isDeeplyEqual(
              newRecordWithSelected.selected,
              currentRecord?.selected,
            )
          ) {
            set(
              objectRecordMultiSelectComponentFamilyState({
                scopeId: instanceId,
                familyKey: newRecordWithSelected.record.id,
              }),
              newRecordWithSelected,
            );
          }
        }
      },
    [objectRecordMultiSelectCheckedRecordsIdsState, instanceId],
  );

  const matchesSearchFilterObjectRecords = useRecoilValue(
    objectRecordMultiSelectMatchesFilterRecordsIdsComponentState({
      scopeId: instanceId,
    }),
  );

  useEffect(() => {
    const allRecords = matchesSearchFilterObjectRecords ?? [];
    updateRecords(allRecords);
    const allRecordsIds = allRecords.map((record) => record.record.id);
    if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
      setObjectRecordsIdsMultiSelect(allRecordsIds);
    }
  }, [
    matchesSearchFilterObjectRecords,
    objectRecordsIdsMultiSelect,
    setObjectRecordsIdsMultiSelect,
    updateRecords,
  ]);

  useEffect(() => {
    setObjectRecordMultiSelectCheckedRecordsIds(
      selectedObjectRecordIds.map((rec) => rec.id),
    );
  }, [selectedObjectRecordIds, setObjectRecordMultiSelectCheckedRecordsIds]);

  return <></>;
};
