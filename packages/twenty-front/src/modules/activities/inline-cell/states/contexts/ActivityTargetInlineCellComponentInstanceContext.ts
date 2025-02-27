import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type ActivityTargetInlineCellComponentInstanceContextProps =
  ComponentStateKeyV2;

export const ActivityTargetInlineCellComponentInstanceContext =
  createComponentInstanceContext<ActivityTargetInlineCellComponentInstanceContextProps>();
