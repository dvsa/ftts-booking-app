// static config
import { getDataverseAppUserClientIds } from '@dvsa/ftts-auth-client';

const isSecure = (): boolean => {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return true;
};

interface Identity {
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret: string;
  scope: string;
  userAssignedEntityClientId: string;
}
export interface RetryPolicy {
  defaultRetryDelay: number;
  exponentialBackoff: boolean;
  maxRetries: number;
  maxRetryAfter: number;
}

export interface Config {
  serviceContextId: string;
  buildVersion: string;
  localPort: string;
  defaultTimeZone: string;
  sessionTtlSessionDuration: number;
  sessionTimeoutWarningMinutes: number;
  googleAnalytics: {
    url: string;
    measurementId: string;
  };
  queueit: {
    enabled: string;
    customerId: string;
    secretKey: string;
    eventId: string;
    layoutName: string;
    culture: string;
    queueDomain: string;
    extendCookieValidity: boolean;
    cookieValidityMinute: number;
    cookieDomain: string;
    version: number;
    redirectUrl: string;
  };
  redisClient: {
    auth_pass: string;
    host: string;
    no_ready_check: boolean;
    port: number;
    tls?: {
      servername: string;
    };
  };
  session: {
    secret: string;
    name: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      name: string;
      maxAge: number;
      httpOnly: boolean;
      signed: boolean;
    };
  };
  currencySymbol: string;
  currencyCode: string;
  appEnv: string;
  notification: {
    baseUrl: string;
    identity: Identity;
    retryPolicy: RetryPolicy;
  };
  location: {
    baseUrl: string;
    identity: Identity;
    retryPolicy: RetryPolicy;
  };
  eligibility: {
    baseUrl: string;
    identity: Identity;
    retryPolicy: RetryPolicy;
  };
  scheduling: {
    baseUrl: string;
    identity: Identity;
    lockTime: number;
    retryPolicy: RetryPolicy;
    maxRetriesByEndpoint: {
      retrieve: number;
      reserve: number;
      confirm: number;
    }
  };
  testCentreIncrementValue: number;
  payment: {
    baseUrl: string;
    identity: Identity;
    redirectUri: string;
    retryPolicy: RetryPolicy;
  };
  mapsApiKey: string;
  crm: {
    auth: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
      userAssignedEntityClientId: string;
      scope: string;
      multipleApplicationUsers: {
        enabled: boolean;
        clientIds: string[];
      }
    };
    retryPolicy: {
      backoff: number;
      exponentialFactor: number,
      maxRetryAfter: number;
      retries: number;
    };
    apiUrl: string;
    priceListId: {
      dvsa: string;
      dva: string;
    };
    ownerId: {
      dvsa: string;
    };
  };
  http: {
    timeout: number;
  };
  view: {
    assetDomain: string;
    assetPath: string;
    gtmID: string;
    insights: string;
    serviceName: string;
  };
  survey: {
    cy: string;
    gb: string;
    ni: string;
  };
  landing: {
    enableInternalEntrypoints: boolean;
    gb: {
      citizen: {
        book: string;
        check: string;
        change: string;
        cancel: string;
      };
      instructor: {
        book: string;
        manageBooking: string;
      };
    };
    cy: {
      citizen: {
        book: string;
      };
    };
    ni: {
      citizen: {
        book: string;
        compensationBook: string;
        manageBooking: string;
      };
      instructor: {
        book: string;
        manageBooking: string;
      };
    };
  };
  refreshTimeForLandingPage: number;
  featureToggles: {
    enableCustomSupportInputValidation: boolean;
    enableExistingBookingValidation: boolean;
    digitalResultsEmailInfo: boolean;
    enableViewNsaBookingSlots: boolean;
  }
}

const gbGovLink = 'https://www.gov.uk';
const niGovLink = 'https://www.nidirect.gov.uk';

const config: Config = {
  serviceContextId: process.env.WEBSITE_SITE_NAME || 'BOOKING-APP-MOCK-CONTEXT-ID',

  buildVersion: process.env.BUILD_VERSION || '99999',

  localPort: process.env.LOCAL_PORT || '3000',

  defaultTimeZone: process.env.DEFAULT_TIME_ZONE || 'Europe/London',

  redisClient: {
    auth_pass: process.env.SESSION_STORAGE_PASSWORD || '',
    host: process.env.SESSION_STORAGE_URL || '',
    no_ready_check: true,
    port: parseInt(process.env.SESSION_STORAGE_PORT || '6380', 10),
    tls: {
      servername: process.env.SESSION_STORAGE_URL || '',
    },
  },

  googleAnalytics: {
    url: process.env.GOOGLE_ANALYTICS_BASE_URL || '',
    measurementId: process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID || '',
  },

  queueit: {
    enabled: process.env.QUEUE_IT_IMPLEMENTATION || '',
    customerId: process.env.QUEUE_IT_CUSTOMER_ID || '',
    secretKey: process.env.QUEUE_IT_SECRET_KEY || '',
    eventId: process.env.QUEUE_IT_EVENT_ID || '',
    layoutName: process.env.QUEUE_IT_LAYOUT_NAME || '',
    culture: 'en-gb',
    queueDomain: process.env.QUEUE_IT_QUEUE_DOMAIN || '',
    extendCookieValidity: true,
    cookieValidityMinute: 30,
    cookieDomain: '',
    version: Number(process.env.QUEUE_IT_VERSION),
    redirectUrl: process.env.CUSTOM_DOMAIN_URI || '',
  },

  sessionTtlSessionDuration: Number(process.env.SESSION_TTL_SESSION_DURATION || 1740),
  sessionTimeoutWarningMinutes: Number(process.env.SESSION_TIMEOUT_WARNING_MINUTES || 5),

  session: {
    secret: process.env.SESSION_STORAGE_SECRET || '',
    name: 'ftts',
    resave: true,
    saveUninitialized: true,
    cookie: {
      // Can only be secure if SSL is active so switch off for local envs
      secure: true,
      name: 'ftts',
      maxAge: Number(process.env.SESSION_TTL_SESSION_DURATION || 29 * 60) * 1000, // 29 minutes
      httpOnly: true,
      signed: true,
    },
  },

  currencySymbol: '£',

  currencyCode: 'GBP',

  appEnv: process.env.APP_ENV || 'local',

  notification: {
    baseUrl: process.env.NOTIFICATION_API_BASE_URL || '',
    identity: {
      azureTenantId: process.env.NOTIFICATIONS_TENANT_ID || '',
      azureClientId: process.env.NOTIFICATIONS_CLIENT_ID || '',
      azureClientSecret: process.env.NOTIFICATIONS_CLIENT_SECRET || '',
      scope: process.env.NOTIFICATION_API_SCOPE || '',
      userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
    },
    retryPolicy: {
      defaultRetryDelay: parseInt(process.env.NOTIFICATION_RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      exponentialBackoff: process.env.NOTIFICATION_RETRY_CLIENT_EXPONETIAL_BACKOFF === 'true',
      maxRetries: parseInt(process.env.NOTIFICATION_RETRY_CLIENT_MAX_RETRIES || '3', 10),
      maxRetryAfter: parseInt(process.env.NOTIFICATION_RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
    },
  },

  location: {
    baseUrl: process.env.LOCATION_API_BASE_URL || '',
    identity: {
      azureTenantId: process.env.LOCATION_TENANT_ID || '',
      azureClientId: process.env.LOCATION_CLIENT_ID || '',
      azureClientSecret: process.env.LOCATION_CLIENT_SECRET || '',
      scope: process.env.LOCATION_API_SCOPE || '',
      userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
    },
    retryPolicy: {
      defaultRetryDelay: parseInt(process.env.LOCATION_RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      exponentialBackoff: process.env.LOCATION_RETRY_CLIENT_EXPONETIAL_BACKOFF === 'true',
      maxRetries: parseInt(process.env.LOCATION_RETRY_CLIENT_MAX_RETRIES || '3', 10),
      maxRetryAfter: parseInt(process.env.LOCATION_RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
    },
  },

  scheduling: {
    baseUrl: process.env.SCHEDULING_API_BASE_URL || '',
    identity: {
      azureTenantId: process.env.SCHEDULING_TENANT_ID || '',
      azureClientId: process.env.SCHEDULING_CLIENT_ID || '',
      azureClientSecret: process.env.SCHEDULING_CLIENT_SECRET || '',
      scope: process.env.SCHEDULING_SCOPE || '',
      userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
    },
    lockTime: parseInt(process.env.SCHEDULING_API_LOCK_TIME || '1800', 10),
    retryPolicy: {
      defaultRetryDelay: parseInt(process.env.SCHEDULING_RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      exponentialBackoff: process.env.SCHEDULING_RETRY_CLIENT_EXPONETIAL_BACKOFF === 'true',
      maxRetries: parseInt(process.env.SCHEDULING_RETRY_CLIENT_MAX_RETRIES || '3', 10),
      maxRetryAfter: parseInt(process.env.SCHEDULING_RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
    },
    maxRetriesByEndpoint: {
      retrieve: parseInt(process.env.SCHEDULING_RETRY_CLIENT_MAX_RETRIES_GET_ENDPOINT || '0', 10),
      reserve: parseInt(process.env.SCHEDULING_RETRY_CLIENT_MAX_RETRIES_RESERVE_ENDPOINT || '1', 10),
      confirm: parseInt(process.env.SCHEDULING_RETRY_CLIENT_MAX_RETRIES_CONFIRM_ENDPOINT || '3', 10),
    },
  },

  eligibility: {
    baseUrl: process.env.ELIGIBILITY_API_BASE_URL || '',
    identity: {
      azureTenantId: process.env.ELIGIBILITY_TENANT_ID || '',
      azureClientId: process.env.ELIGIBILITY_CLIENT_ID || '',
      azureClientSecret: process.env.ELIGIBILITY_CLIENT_SECRET || '',
      scope: process.env.ELIGIBILITY_API_SCOPE || '',
      userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
    },
    retryPolicy: {
      defaultRetryDelay: parseInt(process.env.ELIGIBILITY_RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      exponentialBackoff: process.env.ELIGIBILITY_RETRY_CLIENT_EXPONETIAL_BACKOFF === 'true',
      maxRetries: parseInt(process.env.ELIGIBILITY_RETRY_CLIENT_MAX_RETRIES || '0', 10),
      maxRetryAfter: parseInt(process.env.ELIGIBILITY_RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
    },
  },

  testCentreIncrementValue: Number(process.env.TEST_CENTRE_INCREMENT_VALUE) || 5,

  payment: {
    baseUrl: process.env.PAYMENT_API_BASE_URL || '',
    identity: {
      azureTenantId: process.env.PAYMENT_TENANT_ID || '',
      azureClientId: process.env.PAYMENT_CLIENT_ID || '',
      azureClientSecret: process.env.PAYMENT_CLIENT_SECRET || '',
      scope: process.env.PAYMENT_API_SCOPE || '',
      userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
    },
    redirectUri: process.env.PAYMENT_REDIRECT_URI || '',
    retryPolicy: {
      defaultRetryDelay: parseInt(process.env.PAYMENT_RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      exponentialBackoff: process.env.PAYMENT_RETRY_CLIENT_EXPONETIAL_BACKOFF === 'true',
      maxRetries: parseInt(process.env.PAYMENT_RETRY_CLIENT_MAX_RETRIES || '0', 10),
      maxRetryAfter: parseInt(process.env.PAYMENT_RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
    },
  },

  mapsApiKey: process.env.MAPS_API_KEY || '',

  crm: {
    auth: {
      tenantId: process.env.CRM_TENANT_ID || '',
      clientId: process.env.CRM_CLIENT_ID || '',
      clientSecret: process.env.CRM_CLIENT_SECRET || '',
      userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
      scope: process.env.CRM_SCOPE || '',
      multipleApplicationUsers: {
        enabled: process.env.DAU_USE_MULTI === 'true',
        clientIds: getDataverseAppUserClientIds(),
      },
    },
    apiUrl: process.env.CRM_API_URL || '',
    retryPolicy: {
      backoff: parseInt(process.env.CRM_RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      exponentialFactor: 1.2,
      maxRetryAfter: parseInt(process.env.CRM_RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
      retries: parseInt(process.env.CRM_RETRY_CLIENT_MAX_RETRIES || '3', 10),
    },
    priceListId: {
      dvsa: process.env.CRM_PRICE_LIST_ID_DVSA || '',
      dva: process.env.CRM_PRICE_LIST_ID_DVA || '',
    },
    ownerId: {
      dvsa: process.env.CRM_OWNING_TEAM_DVSA || '',
    },
  },

  http: {
    timeout: parseInt(process.env.DEFAULT_REQUEST_TIMEOUT || '30000', 10),
  },

  view: {
    assetDomain: process.env.ASSETS_DOMAIN || '',
    assetPath: process.env.ASSETS_URL_PREFIX || '/public',
    gtmID: process.env.GOOGLE_TAG_MANAGER_TRACKING_ID || '',
    insights: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '',
    serviceName: 'Book a theory test',
  },

  // defaults are the test values, not production surveys to prevent bad data in prod
  survey: {
    cy: process.env.SURVEY_CY || 'https://www.smartsurvey.co.uk/s/LAJMAM/',
    gb: process.env.SURVEY_GB || 'https://www.smartsurvey.co.uk/s/MMLWFY/',
    ni: process.env.SURVEY_NI || 'https://www.smartsurvey.co.uk/s/UGTG32/',
  },

  landing: {
    enableInternalEntrypoints: `${process.env.ENABLE_INTERNAL_ENTRYPOINTS}` === 'true' || false,
    gb: {
      citizen: {
        book: `${gbGovLink}/book-theory-test`,
        check: `${gbGovLink}/check-theory-test`,
        change: `${gbGovLink}/change-theory-test`,
        cancel: `${gbGovLink}/cancel-theory-test`,
      },
      instructor: {
        book: `${gbGovLink}/book-your-instructor-theory-test`,
        manageBooking: `${gbGovLink}/check-change-cancel-your-instructor-theory-test`,
      },
    },
    cy: {
      citizen: {
        book: `${gbGovLink}/archebu-prawf-gyrru-theori`,
      },
    },
    ni: {
      citizen: {
        book: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
        manageBooking: `${niGovLink}/services/change-or-cancel-your-theory-test-online`,
        compensationBook: `${niGovLink}/services/book-your-theory-test-online`,
      },
      instructor: {
        book: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
        manageBooking: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
      },
    },
  },
  refreshTimeForLandingPage: Number(process.env.REFRESH_TIME_FOR_LANDING_PAGE) || 3,

  featureToggles: {
    enableCustomSupportInputValidation: process.env.ENABLE_CUSTOM_SUPPORT_INPUT_VALIDATION === 'true' || false,
    enableExistingBookingValidation: process.env.ENABLE_EXISTING_BOOKING_VALIDATION !== 'false',
    digitalResultsEmailInfo: process.env.DIGITAL_RESULTS_EMAIL_INFO === 'true',
    enableViewNsaBookingSlots: process.env.ENABLE_VIEW_NSA_BOOKING_SLOTS === 'true',
  },
};

if (!isSecure()) {
  // Overrides for local development
  delete config.redisClient.tls;
  config.session.cookie.secure = false;
}

export default config;
