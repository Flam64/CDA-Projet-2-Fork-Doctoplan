import { gql } from '@apollo/client';

export const DOCUMENTTYPE_QUERY_BYTYPE = gql`
  query GetAllDocType($typeDoc: String!) {
    getAllDocType(typeDoc: $typeDoc) {
      id
      name
    }
  }
`;

export const DOCUMENT_QUERY_BYPATIENT = gql`
  query GetDocumentByID($patientId: String!) {
    getDocumentByID(patientId: $patientId) {
      id
      name
      createdAt
      docType {
        name
      }
      url
    }
  }
`;

export const DOCUMENT_QUERY_MUTATION = gql`
  mutation addDocumentMutation($docInput: PatientDocInput!) {
    addDocument(docInput: $docInput) {
      id
    }
  }
`;
