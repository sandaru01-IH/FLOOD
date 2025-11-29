// Debugging and testing utilities

interface DebugConfig {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  trackPerformance: boolean;
  logApiCalls: boolean;
}

const DEBUG_CONFIG: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'debug',
  trackPerformance: true,
  logApiCalls: true,
};

class DebugLogger {
  private config: DebugConfig;

  constructor(config: DebugConfig) {
    this.config = config;
  }

  log(level: DebugConfig['logLevel'], message: string, data?: any) {
    if (!this.config.enabled) return;

    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);

    if (messageLevel <= currentLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      
      if (data) {
        console[level](prefix, message, data);
      } else {
        console[level](prefix, message);
      }
    }
  }

  error(message: string, error?: any) {
    this.log('error', message, error);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  async trackPerformance(name: string, fn: () => Promise<any>): Promise<any> {
    if (!this.config.trackPerformance) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Performance Error: ${name}`, { duration: `${duration.toFixed(2)}ms`, error });
      throw error;
    }
  }

  logApiCall(method: string, url: string, data?: any, response?: any) {
    if (!this.config.logApiCalls) return;
    
    this.debug(`API ${method}`, {
      url,
      request: data,
      response,
    });
  }
}

export const debug = new DebugLogger(DEBUG_CONFIG);

// Error boundary helper
export function captureError(error: Error, context?: string) {
  debug.error(`Error${context ? ` in ${context}` : ''}`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });

  // In production, you might want to send this to an error tracking service
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error);
  }
}

// Form validation helper
export function validateForm(formData: Record<string, any>, rules: Record<string, (value: any) => boolean | string>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(formData[field]);
    if (result !== true) {
      errors[field] = typeof result === 'string' ? result : `${field} is invalid`;
    }
  }

  return errors;
}

// Test data generator
export function generateTestData() {
  return {
    assessment: {
      name: 'Test User',
      phone: '0712345678',
      family_size: 4,
      water_inside: 'yes' as const,
      can_stay_home: 'no' as const,
      electricity_working: 'no' as const, // Fixed: must be 'yes', 'no', or 'sometimes'
      damaged_items: ['food', 'furniture', 'electronics'],
      has_elderly: true,
      has_children: true,
      has_sick_person: false,
      special_notes: 'Test assessment for debugging',
      area: 'Colombo',
      location: {
        lat: 6.9271,
        lng: 79.8612,
      },
    },
    donationGig: {
      gig_type: 'donate' as const,
      user_type: 'individual' as const,
      name: 'Test Donor',
      phone: '0712345679',
      supplies: ['food', 'water', 'blankets'],
      quantity_description: '50 packets of rice, 100 bottles of water',
      description: 'Test donation',
      area: 'Colombo',
      can_deliver: true,
      delivery_radius: 10,
      preferred_contact: 'phone' as const,
      location: {
        lat: 6.9271,
        lng: 79.8612,
      },
    },
    collectionGig: {
      gig_type: 'collect' as const,
      user_type: 'ngo' as const,
      name: 'Test NGO',
      phone: '0712345680',
      organization_name: 'Test Relief Organization',
      supplies: ['food', 'medicine', 'clothes'],
      quantity_description: 'Need for 100 families',
      description: 'Test collection request',
      area: 'Galle',
      pickup_available: true,
      preferred_contact: 'both' as const,
      location: {
        lat: 6.0329,
        lng: 80.2170,
      },
    },
  };
}

