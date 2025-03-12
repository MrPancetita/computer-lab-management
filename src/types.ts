export interface Computer {
  id: string;
  name: string;
  status: 'operational' | 'non_operational';
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: string;
  computer_id: string;
  type: 'monitor' | 'pc' | 'keyboard' | 'mouse' | 'network';
  status: 'operational' | 'non_operational';
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  computer_id: string;
  component_id: string;
  student_name: string;
  group_name: string;
  description: string;
  reported_by: string;
  created_at: string;
}