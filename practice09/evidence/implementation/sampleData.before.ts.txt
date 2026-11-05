import type { Room, Booking } from './types';

export const SAMPLE_ROOMS: Room[] = [
  { name: 'A-101', building: 'Innovation Hall', capacity: 30, blocked: false },
  { name: 'A-102', building: 'Innovation Hall', capacity: 20, blocked: false },
  { name: 'B-201', building: 'Science Wing', capacity: 40, blocked: true },
  { name: 'B-202', building: 'Science Wing', capacity: 15, blocked: false },
  { name: 'C-301', building: 'Library Tower', capacity: 50, blocked: false },
];

export const SAMPLE_BOOKINGS: Booking[] = [
  { id: 'b1', roomName: 'A-101', start: 540, end: 600, bookedBy: 'Prof. Chen' },
  { id: 'b2', roomName: 'A-101', start: 720, end: 780, bookedBy: 'Study Group A' },
  { id: 'b3', roomName: 'A-102', start: 600, end: 660, bookedBy: 'Lab Team 3' },
  { id: 'b4', roomName: 'B-202', start: 480, end: 540, bookedBy: 'Prof. Diaz' },
  { id: 'b5', roomName: 'C-301', start: 900, end: 960, bookedBy: 'Open Lecture' },
];

/** Default "current time" the app boots with — 10:00 AM in minutes. */
export const DEFAULT_CURRENT_MINUTES = 600;
