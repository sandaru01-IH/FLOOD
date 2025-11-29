// Flood relief appropriate color scheme
// Using colors that are clear, accessible, and appropriate for emergency situations

export const colors = {
  // Severity colors - using clear, distinct colors
  severity: {
    Critical: '#E53E3E', // Red - urgent attention needed
    High: '#F56500',    // Orange - high priority
    Moderate: '#F6AD00', // Amber - moderate priority
    Low: '#38A169',     // Green - manageable
  },
  
  // Status colors
  status: {
    active: '#3182CE',   // Blue - active/available
    fulfilled: '#38A169', // Green - completed/fulfilled
    closed: '#718096',   // Gray - closed/inactive
    pending: '#F6AD00',  // Amber - pending action
  },
  
  // Gig type colors
  gig: {
    donate: '#3182CE',   // Blue - giving/positive
    collect: '#F56500',  // Orange - need/request
  },
  
  // UI colors
  ui: {
    primary: '#2C5282',   // Deep blue - primary actions
    secondary: '#48BB78', // Green - secondary/positive actions
    danger: '#E53E3E',   // Red - danger/urgent
    warning: '#F6AD00',  // Amber - warnings
    info: '#3182CE',     // Blue - information
    background: '#F7FAFC', // Light gray - backgrounds
    surface: '#FFFFFF',   // White - cards/surfaces
    text: {
      primary: '#1A202C',   // Dark gray - primary text
      secondary: '#4A5568', // Medium gray - secondary text
      muted: '#718096',    // Light gray - muted text
    },
  },
  
  // Map colors
  map: {
    affected: '#E53E3E',  // Red - affected areas
    safe: '#38A169',      // Green - safe areas
    warning: '#F6AD00',   // Amber - warning areas
    helper: '#3182CE',    // Blue - helpers
    donation: '#48BB78',  // Green - donation points
  },
};

export function getSeverityColor(severity: Severity): string {
  return colors.severity[severity];
}

import type { Severity, GigType, GigStatus } from '@/types';

export function getGigTypeColor(gigType: GigType): string {
  return colors.gig[gigType];
}

export function getStatusColor(status: GigStatus | 'pending'): string {
  return colors.status[status as GigStatus] || colors.status.pending;
}

