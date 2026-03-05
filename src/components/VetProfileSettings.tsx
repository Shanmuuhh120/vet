import { useState } from 'react';
import { supabase, VetProfile } from '../lib/supabase';
import { Save, User as UserIcon } from 'lucide-react';

interface VetProfileSettingsProps {
  profile: VetProfile;
  onUpdate: () => void;
}

export function VetProfileSettings({ profile, onUpdate }: VetProfileSettingsProps) {
  const [formData, setFormData] = useState({
    specialization: profile.specialization,
    experience_years: profile.experience_years,
    consultation_fee: profile.consultation_fee,
    bio: profile.bio || '',
    is_available: profile.is_available,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const specializations = [
    'General Practice',
    'Surgery',
    'Cardiology',
    'Dermatology',
    'Dentistry',
    'Oncology',
    'Orthopedics',
    'Emergency Care',
    'Ophthalmology',
    'Neurology',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('vet_profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-600">Manage your professional information</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization *
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Tell pet owners about your experience, approach to care, and what makes you unique..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
              Available for appointments
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 font-medium"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Profile Statistics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Average Rating</p>
            <p className="font-bold text-blue-900">{profile.average_rating.toFixed(1)} / 5.0</p>
          </div>
          <div>
            <p className="text-blue-700">Total Reviews</p>
            <p className="font-bold text-blue-900">{profile.total_reviews}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
