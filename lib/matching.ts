// Helper-victim matching algorithm

import type { Helper, Assessment, Match, UrgentNeed, HelperOffering } from '@/types';
import { calculateDistance } from './geolocation';

const SEVERITY_WEIGHTS: Record<string, number> = {
  Critical: 4,
  High: 3,
  Moderate: 2,
  Low: 1,
};

// Map urgent needs to helper offerings
const NEED_TO_OFFERING_MAP: Record<string, HelperOffering[]> = {
  food: ['food', 'dry-rations'],
  clothes: ['food'], // Clothes might be provided with food packages
  shelter: ['temporary-shelter'],
  medicine: ['medicine-pickup'],
  transport: ['transport'],
  'water-pumping': ['cleanup-support'],
  'cleanup-support': ['cleanup-support'],
  'charging-support': ['charging-support'],
};

export function matchHelpersToVictims(
  helper: Helper,
  assessments: Assessment[]
): Match[] {
  const matches: Match[] = [];
  
  // Filter assessments within helper's radius
  const nearbyAssessments = assessments.filter((assessment) => {
    if (!assessment.location || !helper.location) return false;
    const distance = calculateDistance(helper.location, assessment.location);
    return distance <= helper.radius_km;
  });
  
  // Sort by severity (Critical first), then by distance
  nearbyAssessments.sort((a, b) => {
    const severityDiff = 
      SEVERITY_WEIGHTS[b.severity_score] - SEVERITY_WEIGHTS[a.severity_score];
    if (severityDiff !== 0) return severityDiff;
    
    if (!a.location || !b.location || !helper.location) return 0;
    const distA = calculateDistance(helper.location, a.location);
    const distB = calculateDistance(helper.location, b.location);
    return distA - distB;
  });
  
  // Calculate match scores and create matches
  for (const assessment of nearbyAssessments) {
    if (!assessment.location || !helper.location) continue;
    
    const distance = calculateDistance(helper.location, assessment.location);
    const matchScore = calculateMatchScore(helper, assessment, distance);
    
    matches.push({
      id: '', // Will be set by database
      helper_id: helper.id,
      assessment_id: assessment.id,
      match_score: matchScore,
      status: 'pending',
      created_at: new Date().toISOString(),
      distance_km: distance,
    });
  }
  
  // Return top 10 matches
  return matches.slice(0, 10);
}

function calculateMatchScore(
  helper: Helper,
  assessment: Assessment,
  distance: number
): number {
  let score = 0;
  
  // Severity weight (0-40 points)
  score += SEVERITY_WEIGHTS[assessment.severity_score] * 10;
  
  // Distance score (0-30 points, closer = higher)
  const maxDistance = helper.radius_km;
  const distanceScore = Math.max(0, 30 * (1 - distance / maxDistance));
  score += distanceScore;
  
  // Need matching score (0-30 points)
  const needMatchScore = calculateNeedMatchScore(helper.offerings, assessment.urgent_needs);
  score += needMatchScore;
  
  return Math.round(score);
}

function calculateNeedMatchScore(
  offerings: HelperOffering[],
  needs: UrgentNeed[]
): number {
  if (needs.length === 0) return 0;
  
  let matchedNeeds = 0;
  
  for (const need of needs) {
    const compatibleOfferings = NEED_TO_OFFERING_MAP[need] || [];
    const hasMatch = compatibleOfferings.some((offering) => 
      offerings.includes(offering)
    );
    if (hasMatch) matchedNeeds++;
  }
  
  // Score based on percentage of needs matched
  const matchRatio = matchedNeeds / needs.length;
  return Math.round(30 * matchRatio);
}

export function findMatchesForHelper(
  helperId: string,
  helpers: Helper[],
  assessments: Assessment[]
): Match[] {
  const helper = helpers.find((h) => h.id === helperId);
  if (!helper || !helper.active) return [];
  
  return matchHelpersToVictims(helper, assessments);
}

