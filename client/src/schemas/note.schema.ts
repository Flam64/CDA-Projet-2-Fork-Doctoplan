import { gql } from '@apollo/client';

export const GET_NOTE = gql`
  query GetNoteByIDAndDate($dateNote: String!) {
    getNoteByIDAndDate(dateNote: $dateNote) {
      note
      id
    }
  }
`;

export const GET_NOTE_ID = gql`
  query GetNoteByID($getNoteByIdId: String!) {
    getNoteByID(id: $getNoteByIdId) {
      dateNote
      id
      note
    }
  }
`;

export const CEATE_NOTE = gql`
  mutation CreateNote($noteData: NoteInput!) {
    createNote(noteData: $noteData) {
      id
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($updateNoteNoteData2: NoteInput!) {
    updateNote(noteData: $updateNoteNoteData2)
  }
`;
