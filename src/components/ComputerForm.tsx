import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Computer } from '../types';

interface ComputerFormProps {
  computer?: Computer;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ComputerForm({ computer, onSuccess, onCancel }: ComputerFormProps) {
  const [name, setName] = useState(computer?.name || '');
  const [status, setStatus] = useState<'operational' | 'non_operational'>(
    computer?.status || 'operational'
  );
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (computer) {
        // Update
        const { error: updateError } = await supabase
          .from('computers')
          .update({ name, status })
          .eq('id', computer.id);

        if (updateError) throw updateError;
      } else {
        // Create
        const { error: insertError } = await supabase
          .from('computers')
          .insert([{ name, status }]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre del Equipo
        </label>
        <input
          type="text"
          required
          placeholder="PC01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'operational' | 'non_operational')}
        >
          <option value="operational">Operativo</option>
          <option value="non_operational">No Operativo</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {computer ? 'Actualizar' : 'Crear'} Equipo
        </button>
      </div>
    </form>
  );
}