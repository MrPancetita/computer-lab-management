import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Computer } from '../types';
import { Monitor, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import ComputerForm from './ComputerForm';

export default function Dashboard() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComputer, setEditingComputer] = useState<Computer | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchComputers();
  }, []);

  async function fetchComputers() {
    const { data, error } = await supabase
      .from('computers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching computers:', error);
      return;
    }

    setComputers(data);
    setLoading(false);
  }

  const handleDelete = async (computer: Computer) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${computer.name}?`)) {
      return;
    }

    const { error } = await supabase
      .from('computers')
      .delete()
      .eq('id', computer.id);

    if (error) {
      console.error('Error deleting computer:', error);
      return;
    }

    await fetchComputers();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingComputer(undefined);
    fetchComputers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Estado de los Equipos
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingComputer ? 'Editar' : 'Nuevo'} Equipo
            </h2>
            <ComputerForm
              computer={editingComputer}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingComputer(undefined);
              }}
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {computers.map((computer) => (
          <div
            key={computer.id}
            className={`
              rounded-lg shadow-sm p-4 transition-all
              ${
                computer.status === 'operational'
                  ? 'bg-white hover:shadow-md border-l-4 border-green-500'
                  : 'bg-white hover:shadow-md border-l-4 border-red-500'
              }
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Monitor className={`h-5 w-5 ${
                  computer.status === 'operational'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`} />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  {computer.name}
                </h3>
              </div>
              {computer.status === 'non_operational' && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => {
                  setEditingComputer(computer);
                  setShowForm(true);
                }}
                className="p-1 text-gray-400 hover:text-indigo-600"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(computer)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate(`/computer/${computer.id}`)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {computers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay equipos registrados</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar el primer equipo
          </button>
        </div>
      )}
    </div>
  );
}