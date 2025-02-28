import { z } from 'zod';

// Base schemas
export const objectRecordSchema = z.record(z.any());

export const baseWorkflowActionSettingsSchema = z.object({
  input: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  errorHandlingOptions: z.object({
    retryOnFailure: z.object({
      value: z.boolean(),
    }),
    continueOnFailure: z.object({
      value: z.boolean(),
    }),
  }),
});

export const baseWorkflowActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  valid: z.boolean(),
});

export const baseTriggerSchema = z.object({
  name: z.string().optional(),
  type: z.string(),
});

// Action settings schemas
export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      serverlessFunctionId: z.string(),
      serverlessFunctionVersion: z.string(),
      serverlessFunctionInput: z.record(z.any()),
    }),
  });

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      email: z.string(),
      subject: z.string().optional(),
      body: z.string().optional(),
    }),
  });

export const workflowCreateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
    }),
  });

export const workflowUpdateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
      objectRecordId: z.string(),
      fieldsToUpdate: z.array(z.string()),
    }),
  });

export const workflowDeleteRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecordId: z.string(),
    }),
  });

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z.number().optional(),
    }),
  });

// Action schemas
export const workflowCodeActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CODE'),
  settings: workflowCodeActionSettingsSchema,
});

export const workflowSendEmailActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('SEND_EMAIL'),
  settings: workflowSendEmailActionSettingsSchema,
});

export const workflowCreateRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('CREATE_RECORD'),
    settings: workflowCreateRecordActionSettingsSchema,
  },
);

export const workflowUpdateRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('UPDATE_RECORD'),
    settings: workflowUpdateRecordActionSettingsSchema,
  },
);

export const workflowDeleteRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('DELETE_RECORD'),
    settings: workflowDeleteRecordActionSettingsSchema,
  },
);

export const workflowFindRecordsActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FIND_RECORDS'),
  settings: workflowFindRecordsActionSettingsSchema,
});

// Combined action schema
export const workflowActionSchema = z.discriminatedUnion('type', [
  workflowCodeActionSchema,
  workflowSendEmailActionSchema,
  workflowCreateRecordActionSchema,
  workflowUpdateRecordActionSchema,
  workflowDeleteRecordActionSchema,
  workflowFindRecordsActionSchema,
]);

// Trigger schemas
export const workflowDatabaseEventTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('DATABASE_EVENT'),
  settings: z.object({
    eventName: z.string(),
    input: z.object({}).passthrough().optional(),
    outputSchema: z.object({}).passthrough(),
    objectType: z.string().optional(),
  }),
});

export const workflowManualTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('MANUAL'),
  settings: z.object({
    objectType: z.string().optional(),
    outputSchema: z.object({}).passthrough(),
  }),
});

export const workflowCronTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('CRON'),
  settings: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('HOURS'),
      schedule: z.object({ hour: z.number(), minute: z.number() }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('MINUTES'),
      schedule: z.object({ minute: z.number() }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('CUSTOM'),
      pattern: z.string(),
      outputSchema: z.object({}).passthrough(),
    }),
  ]),
});

// Combined trigger schema
export const workflowTriggerSchema = z.discriminatedUnion('type', [
  workflowDatabaseEventTriggerSchema,
  workflowManualTriggerSchema,
  workflowCronTriggerSchema,
]);

// Step output schemas
const workflowExecutorOutputSchema = z.object({
  result: z.any().optional(),
  error: z.string().optional(),
});

const workflowRunOutputStepsOutputSchema = z.record(
  workflowExecutorOutputSchema,
);

// Final workflow run output schema
export const workflowRunOutputSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(workflowActionSchema),
  }),
  stepsOutput: workflowRunOutputStepsOutputSchema.optional(),
  error: z.string().optional(),
});

export const workflowRunSchema = z.object({
  __typename: z.literal('WorkflowRun'),
  id: z.string(),
  workflowVersionId: z.string(),
  output: workflowRunOutputSchema.nullable(),
});

export type WorkflowRunOutput = z.infer<typeof workflowRunOutputSchema>;
