import chalk from 'chalk';
import { Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { MigrationCommandRunner } from 'src/database/commands/command-runners/migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export type ActiveOrSuspendedWorkspacesMigrationCommandOptions = {
  workspaceIds: string[];
  startFromWorkspaceId?: string;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  verbose?: boolean;
};

export type RunOnWorkspaceArgs = {
  options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  workspaceId: string;
  dataSource: WorkspaceDataSource;
  index: number;
  total: number;
};

export abstract class ActiveOrSuspendedWorkspacesMigrationCommandRunner<
  Options extends
    ActiveOrSuspendedWorkspacesMigrationCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions,
> extends MigrationCommandRunner {
  private workspaceIds: string[] = [];
  private startFromWorkspaceId: string | undefined;
  private workspaceCountLimit: number | undefined;

  constructor(
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super();
  }

  @Option({
    flags: '--start-from-workspace-id [workspace_id]',
    description:
      'Start from a specific workspace id. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseStartFromWorkspaceId(val: string): string {
    this.startFromWorkspaceId = val;

    return val;
  }

  @Option({
    flags: '--workspace-count-limit [count]',
    description:
      'Limit the number of workspaces to process. Workspaces are processed in ascending order of id.',
    required: false,
  })
  parseWorkspaceCountLimit(val: string): number {
    this.workspaceCountLimit = parseInt(val);

    if (isNaN(this.workspaceCountLimit)) {
      throw new Error('Workspace count limit must be a number');
    }

    if (this.workspaceCountLimit <= 0) {
      throw new Error('Workspace count limit must be greater than 0');
    }

    return this.workspaceCountLimit;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string): string[] {
    this.workspaceIds.push(val);

    return this.workspaceIds;
  }

  protected async fetchActiveWorkspaceIds(): Promise<string[]> {
    const activeWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
        ...(this.startFromWorkspaceId
          ? { id: MoreThanOrEqual(this.startFromWorkspaceId) }
          : {}),
      },
      order: {
        id: 'ASC',
      },
      take: this.workspaceCountLimit,
    });

    return activeWorkspaces.map((workspace) => workspace.id);
  }

  protected logWorkspaceCount(activeWorkspaceIds: string[]): void {
    if (!activeWorkspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));
    } else {
      this.logger.log(
        chalk.green(
          `Running command on ${activeWorkspaceIds.length} workspaces`,
        ),
      );
    }
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: Options,
  ): Promise<void> {
    const activeWorkspaceIds =
      this.workspaceIds.length > 0
        ? this.workspaceIds
        : await this.fetchActiveWorkspaceIds();

    this.logWorkspaceCount(activeWorkspaceIds);

    if (options.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    try {
      for (const [index, workspaceId] of activeWorkspaceIds.entries()) {
        const dataSource =
          await this.twentyORMGlobalManager.getDataSourceForWorkspace(
            workspaceId,
            false,
          );

        try {
          await this.runOnWorkspace({
            options,
            workspaceId,
            dataSource,
            index: index,
            total: activeWorkspaceIds.length,
          });
        } catch (error) {
          this.logger.error(`Error in workspace ${workspaceId}: ${error}`);
        }

        await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
          workspaceId,
        );
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  protected abstract runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void>;
}
