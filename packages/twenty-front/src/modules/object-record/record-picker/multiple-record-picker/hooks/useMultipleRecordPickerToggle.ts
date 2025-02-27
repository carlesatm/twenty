import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useMultipleRecordPickerToggle = (
  componentInstanceIdFromProps: string,
) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
    componentInstanceIdFromProps,
  );

  const openMultipleObjectsPicker = () => {
    // eslint-disable-next-line no-console
    console.log('openMultipleObjectsPicker', componentInstanceId);
  };

  const closeMultipleObjectsPicker = () => {
    // eslint-disable-next-line no-console
    console.log('closeMultipleObjectsPicker', componentInstanceId);
  };

  return {
    openMultipleObjectsPicker,
    closeMultipleObjectsPicker,
  };
};
