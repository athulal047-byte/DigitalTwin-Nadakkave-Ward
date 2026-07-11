export interface Building {
  bldg_id: string;
  code: string;
  sub_class: string;
  ward_no: string;
  rd_id?: string;
  rd_name?: string;
  locality?: string;
  colony?: string;
  no_floors?: number;
  height_m?: number;
  footprint_m2?: number;
  cons_type?: string;
  bldng_usage?: string;
  no_of_households?: number;
  population?: number;
  water_connection?: string;
  sewer_connection?: string;
  electricity_connection?: string;
  internet_availability?: string;
  structural_condition?: string;
  operational_status?: string;
}

export interface Road {
  road_id: string;
  road_name?: string | null;
  sub_class?: string | null;
  rd_con_mat?: string | null;
  road_hierarchy?: string | null;
  surface_condition?: string | null;
  cw_width_m?: string | null;
  row_width_m?: string | null;
  shape_length_m?: string | null;
  traffic_count?: string | null;
  peak_hour_vol?: string | null;
  speed_profile?: string | null;
  bus_stop_name?: string | null;
  on_street_parking?: string | null;
  off_street_parking?: string | null;
  parking_capacity?: string | null;
  last_updated?: string | null;
  maintenance_status?: string | null;
}

export interface DashboardStats {
  total_buildings: number;
  total_roads: number;
  by_type: { sub_class: string; count: string }[];
  by_ward: { ward_no: string; count: string }[];
  by_status: { code: string; label: string; count: string }[];
  infrastructure: {
    water: string;
    electricity: string;
    sewer: string;
    internet: string;
  };
}

export interface Ward {
  ward_no: number;
  ward_name: string;
  building_count: string;
}

export type UserRole =
  | 'admin'
  | 'municipal'
  | 'department'
  | 'public'
  | 'corporation' 
  | 'electricity_dept' 
  | 'water_dept' 
  | 'road_dept' 
  | 'telecom_dept' 
  | 'solid_waste_dept' 
  | 'environment_dept' 
  | 'disaster_dept' 
  | 'health_dept' 
  | 'citizen';

export interface User {
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
  department?: string;
}

export interface WaterSupply {
  id: number;
  distribution_network_id: string;
  pipe_id: string;
  pipe_diameter: string;
  pipe_material: string;
  valve_id: string;
  overhead_tanks: number;
  consumer_connections: number;
  flow_meters: number;
}

export interface Electricity {
  id: number;
  transformers: number;
  distribution_poles: number;
  feeders: number;
  street_lights: number;
  solar_installation: number;
}

export interface Sewerage {
  id: number;
  sewer_network: string;
  manholes: number;
  stps: number;
  household_connections: number;
}

export interface Telecom {
  id: number;
  ofc_network: string;
  mobile_towers: number;
  wifi_hotspots: number;
}

export interface Environment {
  id: number;
  water_body_id: string;
  waterbody_type: string;
  tree_id: string;
  parks: number;
  temperature_sensors: number;
  humidity_sensors: number;
  rainfall_stations: number;
  air_quality: string;
  water_quality: string;
  noise_levels: string;
}

export interface SolidWaste {
  id: number;
  collection_routes_id: string;
  bins: number;
  vehicles: number;
  transfer_stations: number;
  processing_plants: number;
}

export interface Stormwater {
  id: number;
  drain_id: string;
  drain_type: string;
  culverts: number;
}

export interface SocialInfrastructure {
  id: number;
  facility_id: string;
  facility_name: string;
  facility_type: string;
}

export interface Demographics {
  id: number;
  total_population: number;
  density: string;
  age_distribution: string;
  gender_distribution: string;
  income_groups: string;
  employment: string;
  literacy: string;
  elderly: number;
  children: number;
  pwd: number;
}

export interface EconomicActivity {
  id: number;
  shop_id: string;
  market_id: string;
  vendor_id: string;
  office_id: string;
  industry_id: string;
  service_centre_id: string;
  land_value: string;
  rental_value: string;
  commercial_value: string;
}

export interface DisasterManagement {
  id: number;
  flood_zone_id: string;
  water_logging_point_id: string;
  fire_incident_id: string;
  vulnerable_population: number;
  critical_infrastructure: string;
  evacuation_route_id: string;
  relief_centre_id: string;
  emergency_equipment_id: string;
  response_team_id: string;
}

export interface IoTSensor {
  id: number;
  sensor_id: string;
  sensor_type: string;
  location: string;
  status: string;
}

export interface Governance {
  id: number;
  complaint_id: string;
  grievance_id: string;
  service_request_id: string;
  assessment: string;
  collection: string;
  arrears: string;
  trade_license_id: string;
  building_permit_id: string;
}

export const BUILDING_COLORS: Record<string, string> = {
  'House': '#c8a97e',
  'Office': '#3b82f6',
  'Temple': '#f97316',
  'School': '#22c55e',
  'College': '#10b981',
  'Retail': '#ec4899',
  'Service': '#a855f7',
  'Hotel/Restaurant': '#06b6d4',
  'Manufacturing': '#ef4444',
  'Private Hospital': '#14b8a6',
  'Bank': '#6366f1',
};

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'A': { label: 'Occupied', color: '#22c55e' },
  'V': { label: 'Vacant', color: '#f59e0b' },
  'C': { label: 'Apartment', color: '#3b82f6' },
  'VC': { label: 'Vacant Complex', color: '#6b7280' },
  '305': { label: 'Under Construction', color: '#f97316' },
  '303': { label: 'Dilapidated', color: '#ef4444' },
};