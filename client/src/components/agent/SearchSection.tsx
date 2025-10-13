import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Building2, AlertCircle, ChevronDown } from 'lucide-react';
import { useGetDepartementsQuery } from '@/types/graphql-generated';

type SearchSectionProps = {
  handleSearchCallback: (searchQuery: string, searchType: 'social' | 'department') => void;
  error: boolean;
  loading: boolean;
};

export default function SearchSection({
  handleSearchCallback,
  error,
  loading,
}: SearchSectionProps) {
  const [searchType, setSearchType] = useState<'social' | 'department'>('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: departmentsData, loading: departmentsLoading } = useGetDepartementsQuery();
  const departments = departmentsData?.getDepartements || [];

  const filteredDepartments = departments.filter(dept =>
    dept.label.toLowerCase().includes(departmentSearchTerm.toLowerCase()),
  );

  const handleSearch = () => {
    if (searchType === 'social') {
      handleSearchCallback(searchQuery, 'social');
    } else {
      if (selectedDepartment) {
        handleSearchCallback(selectedDepartment, 'department');
      }
    }
  };

  const handleDepartmentSelect = (departmentId: string, departmentLabel: string) => {
    setSelectedDepartment(departmentId);
    setDepartmentSearchTerm(departmentLabel);
    setIsDropdownOpen(false);
  };

  const handleSearchTypeChange = (type: 'social' | 'department') => {
    setSearchType(type);
    setSearchQuery('');
    setSelectedDepartment('');
    setDepartmentSearchTerm('');
    setIsDropdownOpen(false);
  };

  const isSearchDisabled = searchType === 'social' ? !searchQuery.trim() : !selectedDepartment;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-1"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-borderColor p-6 min-w-[350px]">
        <h2 className="text-xl font-semibold text-blue mb-6 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Recherche
        </h2>

        <div className="mb-6">
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSearchTypeChange('social')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                searchType === 'social'
                  ? 'bg-blue text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue'
              }`}
            >
              <User className="w-4 h-4 inline mr-1" />
              Patient
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSearchTypeChange('department')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                searchType === 'department'
                  ? 'bg-blue text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-1" />
              Service
            </motion.button>
          </div>
        </div>

        <div className="relative mb-4">
          {searchType === 'social' ? (
            <>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: 1212121212122"
                className="w-full pl-12 pr-4 py-3 border border-borderColor rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setDepartmentSearchTerm('');
                }}
                className="w-full pl-12 pr-10 py-3 border border-borderColor rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all cursor-pointer bg-white flex items-center justify-between"
              >
                <span className={selectedDepartment ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedDepartment ? departmentSearchTerm : 'Sélectionner un service'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-borderColor rounded-xl shadow-lg z-50 max-h-60 overflow-hidden"
                >
                  <div className="p-3 border-b border-borderColor">
                    <div className="relative">
                      <input
                        type="text"
                        value={departmentSearchTerm}
                        onChange={e => setDepartmentSearchTerm(e.target.value)}
                        placeholder="Rechercher un service..."
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue/20 focus:border-blue text-sm"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto">
                    {departmentsLoading ? (
                      <div className="p-3 text-center text-gray-500">
                        Chargement des services...
                      </div>
                    ) : filteredDepartments.length > 0 ? (
                      filteredDepartments.map(department => (
                        <button
                          key={department.id}
                          onClick={() => handleDepartmentSelect(department.id, department.label)}
                          className="px-3 py-2 hover:bg-lightBlue cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-blue">{department.label}</div>
                          <div className="text-xs text-gray-500">
                            {department.building} - {department.wing} - {department.level}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Aucun service trouvé
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Erreur lors de la recherche</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          disabled={isSearchDisabled || loading}
          className="w-full bg-blue text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
            />
          ) : (
            'Rechercher'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
