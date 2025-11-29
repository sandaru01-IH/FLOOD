// Simplified, practical severity scoring algorithm

import type { AssessmentFormData, Severity } from '@/types';

export function calculateSeverityScore(data: Partial<AssessmentFormData>): Severity {
  let score = 0;
  
  // Water inside home (0-30 points)
  if (data.water_inside === 'yes') {
    score += 30;
  } else if (data.water_inside === 'partially') {
    score += 15;
  }
  
  // Can stay home (0-25 points)
  if (data.can_stay_home === 'no') {
    score += 25;
  } else if (data.can_stay_home === 'unsure') {
    score += 10;
  }
  
  // Electricity (0-15 points)
  if (data.electricity_working === 'no') {
    score += 15;
  } else if (data.electricity_working === 'sometimes') {
    score += 7;
  }
  
  // Damaged items (0-15 points)
  if (data.damaged_items && data.damaged_items.length > 0) {
    if (data.damaged_items.length >= 4) {
      score += 15;
    } else if (data.damaged_items.length >= 2) {
      score += 10;
    } else {
      score += 5;
    }
  }
  
  // Special needs (0-15 points)
  if (data.has_sick_person) {
    score += 15;
  } else if (data.has_elderly || data.has_children) {
    score += 8;
  }
  
  // Determine severity level
  if (score >= 60 || (data.water_inside === 'yes' && data.can_stay_home === 'no')) {
    return 'Critical';
  } else if (score >= 40 || (data.water_inside === 'yes' || data.can_stay_home === 'no')) {
    return 'High';
  } else if (score >= 20 || data.water_inside === 'partially') {
    return 'Moderate';
  } else {
    return 'Low';
  }
}

export function getSeverityColor(severity: Severity): string {
  const colors = {
    Critical: '#E53E3E', // Red
    High: '#F56500',     // Orange
    Moderate: '#F6AD00', // Amber
    Low: '#38A169',      // Green
  };
  return colors[severity];
}

export function getSeverityLabel(severity: Severity, lang: 'en' | 'si' | 'ta' = 'en'): string {
  const labels: Record<Severity, Record<string, string>> = {
    Critical: { en: 'Critical', si: 'උත්තරීතර', ta: 'முக்கியமான' },
    High: { en: 'High', si: 'ඉහළ', ta: 'உயர்' },
    Moderate: { en: 'Moderate', si: 'මධ්‍යම', ta: 'மிதமான' },
    Low: { en: 'Low', si: 'අඩු', ta: 'குறைந்த' },
  };
  return labels[severity][lang] || labels[severity].en;
}
