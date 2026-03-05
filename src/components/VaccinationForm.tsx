import { useState, useEffect } from 'react';
import { supabase, Vaccination } from '../lib/supabase';
import { X } from 'lucide-react';

interface VaccinationFormProps {
  petId: string;
  vaccination: Vaccination | null;
  onClose: () => void;
}

export function VaccinationForm({ petId, vaccination, onClose }: VaccinationFormProps) {
  const [formData, setFormData] = useState({
    vaccine_name: '',
    date_administered: '',
    next_due_date: '',
    veterinarian_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vaccination) {
      setFormData({
        vaccine_name: vaccination.vaccine_name,
        date_administered: vaccination.date_administered,
        next_due_date: vaccination.next_due_date || '',
        veterinarian_notes: vaccination.veterinarian_notes || '',
      });
    }
  }, [vaccination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (vaccination) {
        const { error } = await supabase
          .from('vaccinations')
          .update(formData)
          .eq('id', vaccination.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vaccinations')
          .insert([{ ...formData, pet_id: petId }]);

        if (error) throw error;
      }

      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {vaccination ? 'Edit Vaccination' : 'Add Vaccination'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaccine Name *
            </label>
            <input
              type="text"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Rabies, DHPP, Bordetella"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Administered *
            </label>
            <input
              type="date"
              value={formData.date_administered}
              onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Due Date
            </label>
            <input
              type="date"
              value={formData.next_due_date}
              onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veterinarian Notes
            </label>
            <textarea
              value={formData.veterinarian_notes}
              onChange={(e) => setFormData({ ...formData, veterinarian_notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Any additional notes about the vaccination"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : vaccination ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
