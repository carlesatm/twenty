import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/upgrade-version-command/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

@Command({
  name: 'workspace:sync-metadata',
  description: 'Sync metadata',
})
export class SyncWorkspaceMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly syncWorkspaceLoggerService: SyncWorkspaceLoggerService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.log(
      `Running workspace sync for workspace: ${workspaceId} (${index} out of ${total})`,
    );

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const { storage, workspaceMigrations } =
      await this.workspaceSyncMetadataService.synchronize(
        {
          workspaceId,
          dataSourceId: dataSourceMetadata.id,
        },
        { applyChanges: !options.dryRun },
      );

    if (options.dryRun) {
      await this.syncWorkspaceLoggerService.saveLogs(
        workspaceId,
        storage,
        workspaceMigrations,
      );
    }

    this.log(
      `Finished synchronizing all active workspaces (${total} workspaces).`,
    );
  }
}
