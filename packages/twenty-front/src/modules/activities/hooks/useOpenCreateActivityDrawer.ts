import { useSetRecoilState } from 'recoil';

import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { IconList } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';
import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const useOpenCreateActivityDrawer = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
}) => {
  const { openRightDrawer } = useRightDrawer();

  const setHotkeyScope = useSetHotkeyScope();

  const { createOneRecord: createOneActivity } = useCreateOneRecord<
    (Task | Note) & { position: 'first' | 'last' }
  >({
    objectNameSingular: activityObjectNameSingular,
  });

  const { createOneRecord: createOneActivityTarget } = useCreateOneRecord<
    TaskTarget | NoteTarget
  >({
    objectNameSingular:
      activityObjectNameSingular === CoreObjectNameSingular.Task
        ? CoreObjectNameSingular.TaskTarget
        : CoreObjectNameSingular.NoteTarget,
    shouldMatchRootQueryFilter: true,
  });

  const setActivityTargetableEntityArray = useSetRecoilState(
    activityTargetableEntityArrayState,
  );
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );
  const setIsNewViewableRecordLoading = useSetRecoilState(
    isNewViewableRecordLoadingState,
  );
  const setIsUpsertingActivityInDB = useSetRecoilState(
    isUpsertingActivityInDBState,
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const { openRecordInCommandMenu } = useCommandMenu();

  const openCreateActivityDrawer = async ({
    targetableObjects,
    customAssignee,
  }: {
    targetableObjects: ActivityTargetableObject[];
    customAssignee?: WorkspaceMember;
  }) => {
    setIsNewViewableRecordLoading(true);
    if (!isCommandMenuV2Enabled) {
      openRightDrawer(RightDrawerPages.ViewRecord, {
        title: activityObjectNameSingular,
        Icon: IconList,
      });
    }
    setViewableRecordId(null);
    setViewableRecordNameSingular(activityObjectNameSingular);

    const activity = await createOneActivity({
      ...(activityObjectNameSingular === CoreObjectNameSingular.Task
        ? {
            assigneeId: customAssignee?.id,
          }
        : {}),
      position: 'last',
    });

    if (targetableObjects.length > 0) {
      const targetableObjectRelationIdName = `${targetableObjects[0].targetObjectNameSingular}Id`;

      await createOneActivityTarget({
        ...(activityObjectNameSingular === CoreObjectNameSingular.Task
          ? {
              taskId: activity.id,
            }
          : {
              noteId: activity.id,
            }),
        [targetableObjectRelationIdName]: targetableObjects[0].id,
      });

      setActivityTargetableEntityArray(targetableObjects);
    } else {
      await createOneActivityTarget({
        ...(activityObjectNameSingular === CoreObjectNameSingular.Task
          ? {
              taskId: activity.id,
            }
          : {
              noteId: activity.id,
            }),
      });

      setActivityTargetableEntityArray([]);
    }

    if (isCommandMenuV2Enabled) {
      openRecordInCommandMenu({
        recordId: activity.id,
        objectNameSingular: activityObjectNameSingular,
        isNewRecord: true,
      });
    } else {
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    }

    setViewableRecordId(activity.id);

    setIsUpsertingActivityInDB(false);
    setIsNewViewableRecordLoading(false);
  };

  return openCreateActivityDrawer;
};
