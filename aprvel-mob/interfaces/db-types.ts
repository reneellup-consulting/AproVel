// Purchase Order
export interface PurchaseOrder {
  id: string;
  po_type: string;
  ref_id: number;
  source_no: string;
  status: string;
  status_by: string;
  status_aprvel_by?: string;
  status_date: string;
  vendor: string;
  vendor_address: string;
  ship_to_address: string;
  ref_nos: string;
  entry_date: string;
  expected_date: any;
  remarks: string;
  rejection_reason?: string;
  comments: string;
  history: string;
  amount: number;
  fuel_customer: string;
  unit_no: string;
  meter_read: number;
  tagged_trips: string;
  fuel_usage_class: string;
  trip_type: string;
  driver: string;
  prev_gas_date: any;
  prev_meter: number;
  prev_no_liters: number;
  prev_price: number;
  prev_total_amt: number;
  order_lines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  id: string;
  parent_id: string;
  line_ref_id: number;
  item: string;
  requestor: string;
  charge_to: string;
  quantity: number;
  unit_of_measure: string;
  unit_cost: number;
  total: number;
  reason: string;
  line_status: string;
  facility_department: string;
  requisition_no: string;
  discount: number;
  remaining_qty: number;
  origin: string;
  destination: string;
  code_no: string;
  tad: number;
}

export interface ProcessedOrder extends PurchaseOrder {
  calculatedTotal: number;
}
