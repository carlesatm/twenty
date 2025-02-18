import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { WorkspaceActivationStatus } from 'twenty-shared';
import { Column, Entity, OneToMany, Relation } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { BaseSoftDeleteEntity } from 'src/engine/utils/base-entities-fields';

registerEnumType(WorkspaceActivationStatus, {
  name: 'WorkspaceActivationStatus',
});

@Entity({ name: 'workspace', schema: 'core' })
@ObjectType()
export class Workspace extends BaseSoftDeleteEntity {
  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inviteHash?: string;

  @OneToMany(() => AppToken, (appToken) => appToken.workspace, {
    cascade: true,
  })
  appTokens: Relation<AppToken[]>;

  @OneToMany(() => KeyValuePair, (keyValuePair) => keyValuePair.workspace, {
    cascade: true,
  })
  keyValuePairs: Relation<KeyValuePair[]>;

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace, {
    onDelete: 'CASCADE',
  })
  workspaceUsers: Relation<UserWorkspace[]>;

  @Field()
  @Column({ default: true })
  allowImpersonation: boolean;

  @Field()
  @Column({ default: true })
  isPublicInviteLinkEnabled: boolean;

  @OneToMany(() => FeatureFlag, (featureFlag) => featureFlag.workspace)
  featureFlags: Relation<FeatureFlag[]>;

  @Field({ nullable: true })
  workspaceMembersCount: number;

  @Field(() => WorkspaceActivationStatus)
  @Column({
    type: 'enum',
    enumName: 'workspace_activationStatus_enum',
    enum: WorkspaceActivationStatus,
    default: WorkspaceActivationStatus.INACTIVE,
  })
  activationStatus: WorkspaceActivationStatus;

  @OneToMany(
    () => PostgresCredentials,
    (postgresCredentials) => postgresCredentials.workspace,
  )
  allPostgresCredentials: Relation<PostgresCredentials[]>;

  @OneToMany(
    () => WorkspaceSSOIdentityProvider,
    (workspaceSSOIdentityProviders) => workspaceSSOIdentityProviders.workspace,
  )
  workspaceSSOIdentityProviders: Relation<WorkspaceSSOIdentityProvider[]>;

  @Field()
  @Column({ default: 1 })
  metadataVersion: number;

  @Field()
  @Column({ default: '' })
  databaseUrl: string;

  @Field()
  @Column({ default: '' })
  databaseSchema: string;

  @Field()
  @Column({ unique: true })
  subdomain: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', unique: true, nullable: true })
  customDomain: string | null;

  @Field()
  @Column({ default: true })
  isGoogleAuthEnabled: boolean;

  @Field()
  @Column({ default: true })
  isPasswordAuthEnabled: boolean;

  @Field()
  @Column({ default: true })
  isMicrosoftAuthEnabled: boolean;

  @Field()
  @Column({ default: false })
  isCustomDomainEnabled: boolean;
}
