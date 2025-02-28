import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let userWorkspaceRepository: Repository<UserWorkspace>;
  let userRepository: Repository<User>;
  let workspaceRepository: Repository<Workspace>;
  let workspaceCacheStorageService: WorkspaceCacheStorageService;
  let messageQueueService: MessageQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOne: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {
            find: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            softDelete: jest.fn(),
          },
        },
        ...[
          WorkspaceManagerService,
          WorkspaceManagerService,
          UserWorkspaceService,
          UserService,
          DomainManagerService,
          CustomDomainService,
          BillingSubscriptionService,
          BillingService,
          EnvironmentService,
          EmailService,
          OnboardingService,
          WorkspaceInvitationService,
          PermissionsService,
          FeatureFlagService,
          ExceptionHandlerService,
          PermissionsService,
        ].map((service) => ({
          provide: service,
          useValue: {},
        })),
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            flush: jest.fn(),
          },
        },
        {
          provide: getQueueToken(MessageQueue.deleteCascadeQueue),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    userWorkspaceRepository = module.get<Repository<UserWorkspace>>(
      getRepositoryToken(UserWorkspace, 'core'),
    );
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User, 'core'),
    );
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    workspaceCacheStorageService = module.get<WorkspaceCacheStorageService>(
      WorkspaceCacheStorageService,
    );
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.deleteCascadeQueue),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRemoveWorkspaceMember', () => {
    it('should soft delete the user workspace record', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        true,
      );

      expect(userWorkspaceRepository.softDelete).toHaveBeenCalledWith({
        userId: 'user-id',
        workspaceId: 'workspace-id',
      });
      expect(userWorkspaceRepository.delete).not.toHaveBeenCalled();
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-id');
    });
    it('should destroy the user workspace record', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        false,
      );

      expect(userWorkspaceRepository.delete).toHaveBeenCalledWith({
        userId: 'user-id',
        workspaceId: 'workspace-id',
      });
      expect(userWorkspaceRepository.softDelete).not.toHaveBeenCalled();
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-id');
    });

    it('should not soft delete the user record if there are other user workspace records', async () => {
      jest
        .spyOn(userWorkspaceRepository, 'find')
        .mockResolvedValue([
          { id: 'remaining-user-workspace-id' } as UserWorkspace,
        ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        false,
      );

      expect(userWorkspaceRepository.delete).toHaveBeenCalledWith({
        userId: 'user-id',
        workspaceId: 'workspace-id',
      });
      expect(userWorkspaceRepository.softDelete).not.toHaveBeenCalled();
      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete the workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
      } as Workspace;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);
      jest
        .spyOn(service, 'deleteMetadataSchemaCacheAndUserWorkspace')
        .mockResolvedValue({} as Workspace);

      await service.deleteWorkspace(mockWorkspace.id, false);

      expect(workspaceRepository.delete).toHaveBeenCalledWith(mockWorkspace.id);
      expect(
        service.deleteMetadataSchemaCacheAndUserWorkspace,
      ).toHaveBeenCalled();
      expect(workspaceRepository.softDelete).not.toHaveBeenCalled();
      expect(workspaceCacheStorageService.flush).toHaveBeenCalledWith(
        mockWorkspace.id,
        mockWorkspace.metadataVersion,
      );
      expect(messageQueueService.add).toHaveBeenCalled();
    });

    it('should soft delete the workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
      } as Workspace;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);
      await service.deleteWorkspace(mockWorkspace.id, true);

      expect(workspaceRepository.softDelete).toHaveBeenCalledWith({
        id: mockWorkspace.id,
      });
      expect(workspaceRepository.delete).not.toHaveBeenCalled();
    });
  });
});
