// Internationalization utilities for Sinhala/Tamil/English

import type { Language } from '@/types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.assess': 'Assess Damage',
    'nav.help': 'I Can Help',
    'nav.map': 'Live Map',
    'nav.admin': 'Admin',
    
    // Common
    'common.submit': 'Submit',
    'common.next': 'Next',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.required': 'Required',
    
    // Assessment Form
    'assess.title': 'Flood Damage Assessment',
    'assess.step.profile': 'Profile',
    'assess.step.property': 'Property',
    'assess.step.losses': 'Losses',
    'assess.step.vulnerabilities': 'Vulnerabilities',
    'assess.step.needs': 'Needs',
    'assess.step.media': 'Photos & Location',
    'assess.step.review': 'Review',
    'assess.name': 'Full Name',
    'assess.phone': 'Phone Number',
    'assess.family_size': 'Family Size',
    'assess.property_type': 'Property Type',
    'assess.property_type.single': 'Single Floor',
    'assess.property_type.multi': 'Multi Floor',
    'assess.water_inside': 'Is water inside your home?',
    'assess.water_depth': 'Water Depth (cm)',
    'assess.rooms_affected': 'Number of Rooms Affected',
    'assess.electricity': 'Electricity Status',
    'assess.electricity.working': 'Working',
    'assess.electricity.not_working': 'Not Working',
    'assess.electricity.intermittent': 'Intermittent',
    'assess.severity': 'Severity',
    'assess.severity.low': 'Low',
    'assess.severity.moderate': 'Moderate',
    'assess.severity.high': 'High',
    'assess.severity.critical': 'Critical',
    
    // Helper Form
    'helper.title': 'I Can Help',
    'helper.offerings': 'What can you offer?',
    'helper.capacity': 'Capacity (people/quantity)',
    'helper.radius': 'Radius (km)',
    'helper.available_times': 'Available Times',
    
    // Map
    'map.title': 'Live Flood Map',
    'map.filter.severity': 'Severity',
    'map.filter.needs': 'Needs',
    'map.filter.verified': 'Verified',
    'map.filter.district': 'District',
    'map.legend.assessments': 'Affected Households',
    'map.legend.helpers': 'Helpers',
    
    // Admin
    'admin.login': 'Admin Login',
    'admin.password': 'Password',
    'admin.dashboard': 'Dashboard',
    'admin.verify': 'Verify Submissions',
    'admin.import': 'Import Data',
  },
  si: {
    // Sinhala translations (placeholder - should be properly translated)
    'nav.home': 'මුල් පිටුව',
    'nav.assess': 'හානි තක්සේරු කරන්න',
    'nav.help': 'මට උදව් කළ හැකියි',
    'nav.map': 'සජීවී සිතියම',
    'common.submit': 'ඉදිරිපත් කරන්න',
    'common.next': 'ඊළඟ',
    'common.back': 'ආපසු',
  },
  ta: {
    // Tamil translations (placeholder - should be properly translated)
    'nav.home': 'முகப்பு',
    'nav.assess': 'சேதம் மதிப்பீடு',
    'nav.help': 'நான் உதவ முடியும்',
    'nav.map': 'நேரடி வரைபடம்',
    'common.submit': 'சமர்ப்பிக்க',
    'common.next': 'அடுத்து',
    'common.back': 'பின்',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key;
}

export function useTranslation(lang: Language) {
  return (key: string) => t(key, lang);
}

