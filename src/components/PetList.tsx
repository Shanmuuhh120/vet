import { useState } from 'react';
import { supabase, Pet } from '../lib/supabase';
import { CreditCard as Edit, Trash2, Eye } from 'lucide-react';
import { PetDetails } from './PetDetails';

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onRefresh: () => void;
}

export function PetList({ pets, onEdit, onRefresh }: PetListProps) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet? This will also delete all associated records.')) {
      return;
    }

    setDeleting(petId);
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (pets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 mb-2">No pets added yet</p>
        <p className="text-sm text-gray-400">Click "Add Pet" to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
              {pet.profile_image ? (
                <img src={pet.profile_image} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-6xl">
                  {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐈' : pet.species === 'BIRD' ? '🦜' : pet.species === 'RABBIT' ? '🐰' : '🐾'}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pet.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Breed:</span> {pet.breed}</p>
                <p><span className="font-medium">Age:</span> {pet.age} years</p>
                <p><span className="font-medium">Gender:</span> {pet.gender}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPet(pet)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-teal-50 text-teal-600 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onEdit(pet)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(pet.id)}
                  disabled={deleting === pet.id}
                  className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPet && (
        <PetDetails pet={selectedPet} onClose={() => setSelectedPet(null)} />
      )}
    </>
  );
}
