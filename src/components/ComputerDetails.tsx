import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Computer, Component, Incident } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Monitor, Cpu, Keyboard, Mouse, Network, AlertCircle, CheckCircle } from 'lucide-react';

export default function ComputerDetails() {
  const { id } = useParams<{ id: string }>();
  const [computer, setComputer] = useState<Computer | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIncident, setNewIncident] = useState({
    studentName: '',
    groupName: '',
    componentId: '',
    description: '',
    reportedBy: ''
  });

  useEffect(() => {
    async function fetchComputerDetails() {
      if (!id) return;

      const [computerData, componentsData, incidentsData] = await Promise.all([
        supabase.from('computers').select('*').eq('id', id).single(),
        supabase.from('components').select('*').eq('computer_id', id),
        supabase.from('incidents').select('*').eq('computer_id', id).order('created_at', { ascending: false })
      ]);

      if (computerData.error) console.error('Error fetching computer:', computerData.error);
      if (componentsData.error) console.error('Error fetching components:', componentsData.error);
      if (incidentsData.error) console.error('Error fetching incidents:', incidentsData.error);

      setComputer(computerData.data);
      setComponents(componentsData.data || []);
      setIncidents(incidentsData.data || []);
      setLoading(false);
    }

    fetchComputerDetails();
  }, [id]);

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'monitor': return <Monitor className="h-5 w-5" />;
      case 'pc': return <Cpu className="h-5 w-5" />;
      case 'keyboard': return <Keyboard className="h-5 w-5" />;
      case 'mouse': return <Mouse className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!computer) return;

    const incident = {
      computer_id: computer.id,
      component_id: newIncident.componentId,
      student_name: newIncident.studentName,
      group_name: newIncident.groupName,
      description: newIncident.description,
      reported_by: newIncident.reportedBy
    };

    const { error } = await supabase.from('incidents').insert([incident]);

    if (error) {
      console.error('Error creating incident:', error);
      return;
    }

    // Refresh incidents
    const { data: newIncidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('computer_id', computer.id)
      .order('created_at', { ascending: false });

    if (newIncidents) {
      setIncidents(newIncidents);
    }

    // Reset form
    setNewIncident({
      studentName: '',
      groupName: '',
      componentId: '',
      description: '',
      reportedBy: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!computer) {
    return <div>Equipo no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {computer.name}
          {computer.status === 'operational' ? (
            <CheckCircle className="inline-block ml-2 h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="inline-block ml-2 h-6 w-6 text-red-500" />
          )}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Registrar Incidencia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre del Estudiante
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newIncident.studentName}
                onChange={(e) => setNewIncident(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Grupo
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newIncident.groupName}
                onChange={(e) => setNewIncident(prev => ({ ...prev, groupName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Componente
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={newIncident.componentId}
              onChange={(e) => setNewIncident(prev => ({ ...prev, componentId: e.target.value }))}
            >
              <option value="">Seleccionar componente</option>
              {components.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={newIncident.description}
              onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profesor
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={newIncident.reportedBy}
              onChange={(e) => setNewIncident(prev => ({ ...prev, reportedBy: e.target.value }))}
            />
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Registrar Incidencia
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Incidencias</h2>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded"
            >
              <div className="flex justify-between">
                <div className="font-medium">{incident.student_name} - {incident.group_name}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(incident.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </div>
              </div>
              <div className="mt-2">{incident.description}</div>
              <div className="mt-1 text-sm text-gray-500">
                Reportado por: {incident.reported_by}
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No hay incidencias registradas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}