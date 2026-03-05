import { useState, useEffect } from 'react';
import { supabase, Pet, Vaccination } from '../lib/supabase';
import { X, Plus, CreditCard as Edit, Trash2, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { VaccinationForm } from './VaccinationForm';

interface PetDetailsProps {
  pet: Pet;
  onClose: () => void;
}

export function PetDetails({ pet, onClose }: PetDetailsProps) {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);

  useEffect(() => {
    fetchVaccinations();
  }, [pet.id]);

  const fetchVaccinations = async () => {
    try {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('pet_id', pet.id)
        .order('date_administered', { ascending: false });

      if (error) throw error;
      setVaccinations(data || []);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vaccination record?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchVaccinations();
    } catch (error) {
      console.error('Error deleting vaccination:', error);
    }
  };

  const handleEditVaccination = (vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    setShowVaccinationForm(true);
  };

  const handleAddVaccination = () => {
    setEditingVaccination(null);
    setShowVaccinationForm(true);
  };

  const handleVaccinationFormClose = () => {
    setShowVaccinationForm(false);
    setEditingVaccination(null);
    fetchVaccinations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPCOMING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5" />;
      case 'UPCOMING':
        return <Calendar className="w-5 h-5" />;
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{pet.name}'s Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg h-64 flex items-center justify-center">
                {pet.profile_image ? (
                  <img src={pet.profile_image} alt={pet.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-8xl">
                    {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : pet.species === 'BIRD' ? '🦜' : pet.species === 'RABBIT' ? '🐰' : '🐾'}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Breed</p>
                  <p className="font-medium text-gray-900">{pet.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{pet.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">{pet.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Species</p>
                  <p className="font-medium text-gray-900">{pet.species}</p>
                </div>
              </div>

              {pet.medical_history && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Medical History</p>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{pet.medical_history}</p>
                </div>
              )}

              {pet.current_symptoms && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Symptoms</p>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{pet.current_symptoms}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Vaccination History</h3>
              <button
                onClick={handleAddVaccination}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vaccination</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              </div>
            ) : vaccinations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No vaccination records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vaccinations.map((vaccination) => (
                  <div key={vaccination.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{vaccination.vaccine_name}</h4>
                        <p className="text-sm text-gray-500">Administered: {new Date(vaccination.date_administered).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(vaccination.status)}`}>
                          {getStatusIcon(vaccination.status)}
                          <span>{vaccination.status}</span>
                        </span>
                        <button
                          onClick={() => handleEditVaccination(vaccination)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVaccination(vaccination.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {vaccination.next_due_date && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Next Due:</span> {new Date(vaccination.next_due_date).toLocaleDateString()}
                      </p>
                    )}

                    {vaccination.veterinarian_notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Notes:</span> {vaccination.veterinarian_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showVaccinationForm && (
        <VaccinationForm
          petId={pet.id}
          vaccination={editingVaccination}
          onClose={handleVaccinationFormClose}
        />
      )}
    </div>
  );
}
