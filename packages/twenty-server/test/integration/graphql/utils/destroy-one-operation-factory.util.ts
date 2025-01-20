import { capitalize } from '@twenty/shared';
import gql from 'graphql-tag';

type DestroyOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  recordId: string;
};

export const destroyOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  recordId,
}: DestroyOneOperationFactoryParams) => ({
  query: gql`
    mutation Destroy${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: ID!) {
      destroy${capitalize(objectMetadataSingularName)}(id: $${objectMetadataSingularName}Id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    [`${objectMetadataSingularName}Id`]: recordId,
  },
});
