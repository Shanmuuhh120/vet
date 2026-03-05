import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Pet } from '../lib/supabase';
import { Plus, LogOut, User, Calendar, Stethoscope, Bell } from 'lucide-react';
import { PetList } from '../components/PetList';
import { PetForm } from '../components/PetForm';
import { VaccinationAlerts } from '../components/VaccinationAlerts';
import { VetBrowser } from '../components/VetBrowser';
import { AppointmentsList } from '../components/AppointmentsList';

type TabType = 'pets' | 'vaccinations' | 'vets' | 'appointments' | 'profile';

export function PetDashboard() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pets');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setShowPetForm(true);
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setShowPetForm(true);
  };

  const handlePetFormClose = () => {
    setShowPetForm(false);
    setEditingPet(null);
    fetchPets();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FurrEver</h1>
                <p className="text-xs text-gray-500">Pet Owner Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{userProfile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pets'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>My Pets</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('vaccinations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'vaccinations'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Vaccination Alerts</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('vets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'vets'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>Find Vets</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Appointments</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'pets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
              <button
                onClick={handleAddPet}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Pet</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              </div>
            ) : (
              <PetList pets={pets} onEdit={handleEditPet} onRefresh={fetchPets} />
            )}
          </div>
        )}

        {activeTab === 'vaccinations' && <VaccinationAlerts pets={pets} />}

        {activeTab === 'vets' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Veterinarians</h2>
            <VetBrowser pets={pets} />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>
            <AppointmentsList />
          </div>
        )}
      </div>

      {showPetForm && (
        <PetForm
          pet={editingPet}
          onClose={handlePetFormClose}
        />
      )}
    </div>
  );
}
