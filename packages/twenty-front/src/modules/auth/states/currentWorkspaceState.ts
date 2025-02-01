import { createState } from "twenty-shared";

import { Workspace } from '~/generated/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  | 'id'
  | 'inviteHash'
  | 'logo'
  | 'displayName'
  | 'allowImpersonation'
  | 'featureFlags'
  | 'activationStatus'
  | 'billingSubscriptions'
  | 'currentBillingSubscription'
  | 'workspaceMembersCount'
  | 'isPublicInviteLinkEnabled'
  | 'isGoogleAuthEnabled'
  | 'isMicrosoftAuthEnabled'
  | 'isPasswordAuthEnabled'
  | 'hasValidEnterpriseKey'
  | 'subdomain'
  | 'hostname'
  | 'metadataVersion'
>;

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
