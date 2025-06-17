import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import SearchBar from '../components/form/SearchBar';
import { describe, expect, it } from 'vitest';

type Patient = {
  id: string;
  firstname: string;
  lastname: string;
  social_number: string;
};

describe('SearchBar', () => {
  it('affiche les patients quand une recherche valide est tapée', async () => {
    // État simulé
    let searchQuery = '';
    let isOpen = false;

    const patients: Patient[] = [
      { id: '1', firstname: 'John', lastname: 'Doe', social_number: '1234567890' },
    ];

    const setSearchQuery = (value: string) => {
      searchQuery = value;
      isOpen = true;
      rerenderSearchBar();
    };

    const setIsOpen = (value: boolean) => {
      isOpen = value;
      rerenderSearchBar();
    };

    const renderResult = render(
      <SearchBar
        placeholder="Rechercher un patient"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        sources={[
          {
            name: 'Patients',
            items: [],
            loading: false,
            getKey: item => item.id,
          },
        ]}
      >
        {(item: Patient) => (
          <div>
            {item.firstname} {item.lastname} - {item.social_number}
          </div>
        )}
      </SearchBar>,
    );

    const rerenderSearchBar = () => {
      renderResult.rerender(
        <SearchBar
          placeholder="Rechercher un patient"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          sources={[
            {
              name: 'Patients',
              items: searchQuery === 'jo' ? patients : [],
              loading: false,
              getKey: item => item.id,
            },
          ]}
        >
          {(item: Patient) => (
            <div>
              {item.firstname} {item.lastname} - {item.social_number}
            </div>
          )}
        </SearchBar>,
      );
    };

    // Interaction utilisateur
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'jo' } });

    // Attente et vérifications
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });
});
