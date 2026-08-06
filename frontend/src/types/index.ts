export type UserRole = 'ADMIN' | 'APPROVER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export type VehicleType = 'PASSENGER' | 'CARGO' | 'HEAVY_EQUIPMENT' | 'AMBULANCE';
export type VehicleOwnership = 'COMPANY' | 'RENTAL';
export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE' | 'INACTIVE';

export interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  type: VehicleType;
  ownership: VehicleOwnership;
  status: VehicleStatus;
  created_at?: string;
}

export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'INACTIVE';

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  status: DriverStatus;
  created_at?: string;
}

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReservationApproval {
  id: string;
  reservation_id: string;
  reservation?: Reservation;
  approver_id: string;
  approver?: User;
  approval_level: number;
  status: ApprovalStatus;
  notes?: string;
  approved_at?: string;
}

export interface Reservation {
  id: string;
  reservation_code: string;
  user_id: string;
  user?: User;
  vehicle_id: string;
  vehicle?: Vehicle;
  driver_id: string;
  driver?: Driver;
  purpose: string;
  destination: string;
  start_datetime: string;
  end_datetime: string;
  status: ReservationStatus;
  current_approval_level: number;
  approvals?: ReservationApproval[];
  created_at?: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  driver_id: string;
  driver?: Driver;
  fuel_date: string;
  fuel_amount: number;
  fuel_cost: number;
  odometer: number;
  notes?: string;
  created_at?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  service_date: string;
  service_type: 'ROUTINE' | 'REPAIR' | 'EMERGENCY';
  workshop: string;
  cost: number;
  next_service_date?: string;
  notes?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  log_name: string;
  description: string;
  subject_type?: string;
  causer_id?: string;
  causer?: User;
  properties?: Record<string, any>;
  created_at: string;
}

export interface DashboardMetrics {
  total_vehicles: number;
  available_vehicles: number;
  reserved_vehicles: number;
  maintenance_vehicles: number;
  monthly_reservations: { month: string; total: number }[];
  vehicle_utilization: { type: string; count: number }[];
  fuel_consumption: { month: string; liters: number; cost: number }[];
  reservation_status_distribution: { status: string; count: number }[];
  top_used_vehicles: { plate_number: string; brand: string; model: string; trip_count: number }[];
}
