// 🧪 Importation des outils de test
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
// 📦 Composant à tester
import SearchBar from '../components/form/SearchBar';
// 🔍 Fonctions utilitaires pour structurer les tests avec Vitest
import { describe, expect, it } from 'vitest';

// 📄 Typage des objets Patient qu’on utilise dans la simulation
type Patient = {
  id: string;
  firstname: string;
  lastname: string;
  social_number: string;
};

// 📦 Groupe de tests pour le composant SearchBar
describe('SearchBar', () => {
  // 🎯 Cas de test : la barre de recherche affiche les patients après saisie
  it('affiche les patients quand une recherche valide est tapée', async () => {
    // 🔁 Variables d’état simulées (comme dans un useState, mais manuelles ici)
    let searchQuery = '';
    let isOpen = false;

    // 👤 Liste de patients fictifs pour le test
    const patients: Patient[] = [
      { id: '1', firstname: 'John', lastname: 'Doe', social_number: '1234567890' },
    ];

    // 🔄 Fausse fonction pour simuler la mise à jour du texte recherché
    const setSearchQuery = (value: string) => {
      searchQuery = value;
      isOpen = true; // Ouvre la dropdown automatiquement
      rerenderSearchBar(); // On force le composant à se mettre à jour
    };

    // 🔄 Fausse fonction pour simuler l’ouverture/fermeture de la dropdown
    const setIsOpen = (value: boolean) => {
      isOpen = value;
      rerenderSearchBar(); // Re-render du composant avec la nouvelle valeur
    };

    // 🧪 Premier rendu du composant SearchBar (avec searchQuery vide, donc pas de résultat encore)
    const renderResult = render(
      <SearchBar
        placeholder="Rechercher un patient"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        sources={[
          // Liste de sources (ici : Patients)
          {
            name: 'Patients',
            items: [], // Aucun résultat au départ
            loading: false,
            getKey: item => item.id,
          },
        ]}
      >
        {/* 🔍 Format d’affichage d’un résultat */}
        {(item: Patient) => (
          <div>
            {item.firstname} {item.lastname} - {item.social_number}
          </div>
        )}
      </SearchBar>,
    );

    // 🔁 Fonction appelée chaque fois qu’on modifie une variable d’état
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
              // Affiche les patients si le texte tapé est "jo"
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

    // 🧑‍💻 Simulation de l’utilisateur qui tape "jo" dans la barre de recherche
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'jo' } });

    // ⏳ Attente que les résultats apparaissent
    await waitFor(() => {
      // ✅ Vérifie que le nom du patient apparaît dans le DOM
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    });
  });
});
