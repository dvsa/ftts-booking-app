// static config

const isSecure = (): boolean => {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = {
  // @Todo: populate from env with real booking app context id
  serviceContextId: 'BOOKING-APP-MOCK-CONTEXT-ID',

  localPort: process.env.LOCAL_PORT || '3000',

  defaultTimeZone: process.env.DEFAULT_TIME_ZONE || 'Europe/London',

  redisClient: {
    auth_pass: process.env.SESSION_STORAGE_PASSWORD,
    host: process.env.SESSION_STORAGE_URL,
    no_ready_check: true,
    port: parseInt(process.env.SESSION_STORAGE_PORT || '6380', 10),
    tls: {
      servername: process.env.SESSION_STORAGE_URL,
    },
  },

  session: {
    secret: process.env.SESSION_STORAGE_SECRET || '',
    name: 'ftts',
    resave: false,
    saveUninitialized: true,
    cookie: {
      // Can only be secure if SSL is active so switch off for local envs
      secure: true,
      name: 'ftts',
      maxAge: 1000 * 60 * 30, // 30 minutes
      httpOnly: true,
      signed: true,
    },
  },

  dbUrl: process.env.DB_URL || 'http://localhost:8000',

  misUrl: process.env.MIS_URL || 'http://localhost:4567',

  dbRegion: process.env.DB_REGION || 'eu-west-1',

  misRegion: process.env.MIS_REGION || 'http://localhost:4567',

  providerURLs: process.env.PROVIDER_URLS ? JSON.parse(process.env.PROVIDER_URLS) : {
    '0001': 'http://localhost:3003',
    '0002': 'http://localhost:3003',
    '0003': 'http://localhost:3003',
    '0004': 'http://localhost:3003',
  },

  providerAccessToken: process.env.PROVIDER_ACCESS_TOKEN || '',

  misStreamName: process.env.MIS_NAME || 'bookings',

  currencySymbol: '£',

  currencyCode: 'GBP',

  appEnv: process.env.APP_ENV || 'local',

  dvlaUrl: process.env.DVLA_URL || 'http://localhost:4000',

  dvlaAccessToken: process.env.DVLA_ACCESS_TOKEN || '',

  apim: {
    location: {
      url: process.env.APIM_OAUTH_ENDPOINT || '',
      clientId: process.env.APIM_LOCAPI_CLIENT_ID || '',
      clientSecret: process.env.APIM_LOCAPI_CLIENT_SECRET || '',
      scope: process.env.LOCATION_API_SCOPE || '',
    },
    notification: {
      url: process.env.APIM_OAUTH_ENDPOINT || '',
      clientId: process.env.APIM_NTFAPI_CLIENT_ID || '',
      clientSecret: process.env.APIM_NTFAPI_CLIENT_SECRET || '',
      scope: process.env.NOTIFICATION_API_SCOPE || '',
    },
    payment: {
      url: process.env.APIM_OAUTH_ENDPOINT || '',
      clientId: process.env.APIM_PMTAPI_CLIENT_ID || '',
      clientSecret: process.env.APIM_PMTAPI_CLIENT_SECRET || '',
      scope: process.env.PAYMENT_API_SCOPE || '',
    },
    scheduling: {
      identity: {
        azureTenantId: process.env.SCHEDULING_TENANT_ID || '',
        azureClientId: process.env.SCHEDULING_CLIENT_ID || '',
        azureClientSecret: process.env.SCHEDULING_CLIENT_SECRET || '',
        scope: process.env.SCHEDULING_SCOPE || '',
        userAssignedEntityClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
      },
    },
  },

  notification: {
    baseUrl: process.env.NOTIFICATION_API_BASE_URL || '',
  },

  location: {
    baseUrl: process.env.LOCATION_API_BASE_URL || '',
  },

  scheduling: {
    baseUrl: process.env.SCHEDULING_API_BASE_URL || '',
    lockTime: parseInt(process.env.SCHEDULING_API_LOCK_TIME || '900', 10),
  },

  testCentreIncrementValue: Number(process.env.TEST_CENTRE_INCREMENT_VALUE) || 5,

  payment: {
    redirectUri: process.env.PAYMENT_REDIRECT_URI || 'http://ftts-beta.local',
    baseUrl: process.env.PAYMENT_API_BASE_URL || 'http://payment-api:7072',
  },

  mapsApiKey: process.env.MAPS_API_KEY,

  crm: {
    auth: {
      url: process.env.CRM_TOKEN_URL || '',
      clientId: process.env.CRM_CLIENT_ID || '',
      clientSecret: process.env.CRM_CLIENT_SECRET || '',
      resource: process.env.CRM_BASE_URL || '',
    },
    apiUrl: process.env.CRM_API_URL || '',
  },

  http: {
    timeout: parseInt(process.env.DEFAULT_REQUEST_TIMEOUT || '30000', 10),
    retryClient: {
      maxRetries: parseInt(process.env.RETRY_CLIENT_MAX_RETRIES || '3', 10),
      defaultRetryDelay: parseInt(process.env.RETRY_CLIENT_DEFAULT_DELAY || '300', 10),
      maxRetryAfter: parseInt(process.env.RETRY_CLIENT_MAX_RETRY_AFTER || '1000', 10),
    },
  },

  view: {
    assetPath: process.env.ASSETS_URL_PREFIX || '/public',
    gtmID: process.env.GOOGLE_TAG_MANAGER_TRACKING_ID,
    insights: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    serviceName: 'Book a theory test',
    theoryTestPriceInGbp: '23.00',
  },
};

if (!isSecure()) {
  // Overrides for local development
  delete config.redisClient.tls;
  config.session.cookie.secure = false;
}

export default config;
