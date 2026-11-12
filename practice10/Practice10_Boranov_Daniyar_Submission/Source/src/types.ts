export interface Booking {
  id: string;
  roomName: string;
  start: number; // minutes from midnight (0–1440)
  end: number; // minutes from midnight (0–1440)
  bookedBy: string;
}

export interface Room {
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface ValidationResult {
  valid: boolean;
  messages: string[];
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'blocked';
