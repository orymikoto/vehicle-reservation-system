export type LocationType = 'HEADQUARTERS' | 'BRANCH' | 'MINE';

export interface Location {
  id: string;
  code: string;
  name: string;
  region: string;
  address?: string;
  type: LocationType;
  is_active: boolean;
  created_at?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'VEHICLE_ADMIN' | 'APPROVER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location_id?: string | null;
  location?: Location;
  created_at?: string;
}

export type VehicleType = 'PASSENGER' | 'CARGO' | 'HEAVY_EQUIPMENT' | 'AMBULANCE';
export type VehicleOwnership = 'COMPANY' | 'RENTAL';
export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE' | 'IN_TRANSFER' | 'INACTIVE';

export interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  type: VehicleType;
  ownership: VehicleOwnership;
  status: VehicleStatus;
  location_id?: string;
  location?: Location;
  created_at?: string;
}

export type DriverStatus = 'ACTIVE' | 'ASSIGNED' | 'ON_LEAVE' | 'TRANSFERRED';

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  status: DriverStatus;
  location_id?: string;
  location?: Location;
  created_at?: string;
}

export type TransferStatus = 'PENDING_ORIGIN' | 'PENDING_DESTINATION' | 'COMPLETED' | 'REJECTED';

export interface VehicleTransfer {
  id: string;
  vehicle_id: string;
  vehicle?: Vehicle;
  origin_location_id: string;
  origin_location?: Location;
  destination_location_id: string;
  destination_location?: Location;
  requested_by: string;
  requester?: User;
  origin_approved_by?: string;
  origin_approver?: User;
  destination_approved_by?: string;
  destination_approver?: User;
  status: TransferStatus;
  remarks?: string;
  transferred_at?: string;
  created_at?: string;
}

export interface DriverTransfer {
  id: string;
  driver_id: string;
  driver?: Driver;
  origin_location_id: string;
  origin_location?: Location;
  destination_location_id: string;
  destination_location?: Location;
  requested_by: string;
  requester?: User;
  origin_approved_by?: string;
  origin_approver?: User;
  destination_approved_by?: string;
  destination_approver?: User;
  status: TransferStatus;
  remarks?: string;
  transferred_at?: string;
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
  location_id: string;
  location?: Location;
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

export interface LocationSummary {
  id: string;
  code: string;
  name: string;
  region: string;
  type: LocationType;
  vehicles: number;
  drivers: number;
  reservations_today: number;
  pending_approvals: number;
  transfers: number;
}

export interface ExpenseDistribution {
  fuel_cost: number;
  maintenance_cost: number;
  grand_total: number;
  fuel_percentage: number;
  maintenance_percentage: number;
}

export interface TopFuelSite {
  id: string;
  code: string;
  name: string;
  region: string;
  total_fuel_cost: number;
  total_liters: number;
}

export interface DashboardMetrics {
  total_vehicles: number;
  available_vehicles: number;
  reserved_vehicles: number;
  maintenance_vehicles: number;
  in_transfer_vehicles: number;
  location_summaries: LocationSummary[];
  combined_expenses_trend: { month: string; total_expense: number }[];
  fuel_trend: { month: string; liters: number; cost: number }[];
  maintenance_trend: { month: string; cost: number }[];
  expense_distribution: ExpenseDistribution;
  top_fuel_sites: TopFuelSite[];
  vehicle_utilization: { type: string; count: number }[];
}
