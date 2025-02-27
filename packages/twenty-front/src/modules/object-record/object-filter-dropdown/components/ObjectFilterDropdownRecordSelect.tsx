import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  getFilterTypeFromFieldType,
  getRelationObjectMetadataNameSingular,
} from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { simpleRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/simpleRelationFilterValueSchema';
import { isDefined } from 'twenty-shared';
import { IconUserCircle } from 'twenty-ui';
import { v4 } from 'uuid';

export const EMPTY_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownRecordSelectProps = {
  viewComponentId?: string;
};

export const ObjectFilterDropdownRecordSelect = ({
  viewComponentId,
}: ObjectFilterDropdownRecordSelectProps) => {
  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const objectFilterDropdownSelectedRecordIds = useRecoilComponentValueV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
  );

  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilComponentStateV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter(viewComponentId);

  const { isCurrentWorkspaceMemberSelected } = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: simpleRelationFilterValueSchema.parse(
        selectedFilter?.value,
      ),
    })
    .parse(selectedFilter?.value);

  if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
    throw new Error('fieldMetadataItemUsedInFilterDropdown is not defined');
  }

  const objectNameSingular = getRelationObjectMetadataNameSingular({
    field: fieldMetadataItemUsedInFilterDropdown,
  });

  if (!isDefined(objectNameSingular)) {
    throw new Error('relationObjectMetadataNameSingular is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectLabelPlural = objectMetadataItem?.labelPlural;

  if (!isDefined(objectNameSingular)) {
    throw new Error('objectNameSingular is not defined');
  }

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: objectFilterDropdownSelectedRecordIds,
      objectNameSingular,
      limit: 10,
    });

  const currentWorkspaceMemberSelectableItem: SelectableItem = {
    id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
    name: 'Me',
    isSelected: isCurrentWorkspaceMemberSelected ?? false,
    AvatarIcon: IconUserCircle,
  };

  const pinnedSelectableItems: SelectableItem[] =
    objectNameSingular === 'workspaceMember'
      ? [currentWorkspaceMemberSelectableItem]
      : [];

  const filteredPinnedSelectableItems = pinnedSelectableItems.filter((item) =>
    item.name
      .toLowerCase()
      .includes(objectFilterDropdownSearchInput.toLowerCase()),
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const handleMultipleRecordSelectChange = (
    itemToSelect: SelectableItem,
    isNewSelectedValue: boolean,
  ) => {
    if (loading) {
      return;
    }

    const isItemCurrentWorkspaceMember =
      itemToSelect.id === CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID;

    const selectedRecordIdsWithAddedRecord = [
      ...objectFilterDropdownSelectedRecordIds,
      itemToSelect.id,
    ];

    const selectedRecordIdsWithRemovedRecord =
      objectFilterDropdownSelectedRecordIds.filter(
        (id) => id !== itemToSelect.id,
      );

    const newSelectedRecordIds = isItemCurrentWorkspaceMember
      ? objectFilterDropdownSelectedRecordIds
      : isNewSelectedValue
        ? selectedRecordIdsWithAddedRecord
        : selectedRecordIdsWithRemovedRecord;

    const newIsCurrentWorkspaceMemberSelected = isItemCurrentWorkspaceMember
      ? isNewSelectedValue
      : isCurrentWorkspaceMemberSelected;

    const selectedRecordNames = [
      ...recordsToSelect,
      ...selectedRecords,
      ...filteredSelectedRecords,
    ]
      .filter(
        (record, index, self) =>
          self.findIndex((r) => r.id === record.id) === index,
      )
      .filter((record) => newSelectedRecordIds.includes(record.id))
      .map((record) => record.name);

    const selectedPinnedItemNames = newIsCurrentWorkspaceMemberSelected
      ? [currentWorkspaceMemberSelectableItem.name]
      : [];

    const selectedItemNames = [
      ...selectedPinnedItemNames,
      ...selectedRecordNames,
    ];

    const filterDisplayValue =
      selectedItemNames.length > MAX_RECORDS_TO_DISPLAY
        ? `${selectedItemNames.length} ${objectLabelPlural.toLowerCase()}`
        : selectedItemNames.join(', ');

    if (isDefined(selectedOperandInDropdown)) {
      const newFilterValue =
        newSelectedRecordIds.length > 0 || newIsCurrentWorkspaceMemberSelected
          ? JSON.stringify({
              isCurrentWorkspaceMemberSelected:
                newIsCurrentWorkspaceMemberSelected,
              selectedRecordIds: newSelectedRecordIds,
            } satisfies RelationFilterValue)
          : '';

      const recordFilterInDropdown = currentRecordFilters.find(
        (recordFilter) =>
          recordFilter.fieldMetadataId ===
          fieldMetadataItemUsedInFilterDropdown.id,
      );

      setObjectFilterDropdownSelectedRecordIds(newSelectedRecordIds);

      const filterId = recordFilterInDropdown?.id ?? v4();

      applyRecordFilter({
        id: selectedFilter?.id ? selectedFilter.id : filterId,
        type: getFilterTypeFromFieldType(
          fieldMetadataItemUsedInFilterDropdown.type,
        ),
        label: fieldMetadataItemUsedInFilterDropdown.label,
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: fieldMetadataItemUsedInFilterDropdown.id,
        value: newFilterValue,
        viewFilterGroupId: selectedFilter?.viewFilterGroupId,
      });
    }
  };

  return (
    <>
      {filteredPinnedSelectableItems.length > 0 && (
        <>
          <ObjectFilterDropdownRecordPinnedItems
            selectableItems={filteredPinnedSelectableItems}
            onChange={handleMultipleRecordSelectChange}
          />
          <DropdownMenuSeparator />
        </>
      )}
      <MultipleSelectDropdown
        selectableListId="object-filter-record-select-id"
        hotkeyScope={RecordPickerHotkeyScope.RecordPicker}
        itemsToSelect={recordsToSelect}
        filteredSelectedItems={filteredSelectedRecords}
        selectedItems={selectedRecords}
        onChange={handleMultipleRecordSelectChange}
        searchFilter={objectFilterDropdownSearchInput}
        loadingItems={loading}
      />
    </>
  );
};
