import APP_CONFIG from '../../../public/config.json';

const env = `${APP_CONFIG.apiHost}${APP_CONFIG.apiPrefix}`;

export const ApiPath = {
  auth: {
    authenticate: `${env}/auth/authenticate`,
    refresh: `${env}/auth/refresh`,
    logout: `${env}/auth/logout`,
    register: `${env}/auth/register`,
    changePassword: `${env}/auth/password`,
    changeUsername: `${env}/auth/username`
  },

  foodTypes: {
    get: `${env}/food-types`,
    getById: `${env}/food-types/{}`,
    delete: `${env}/food-types/{}`,
    put: `${env}/food-types/{}`,
    post: `${env}/food-types`
  },

  user: {
    delete: `${env}/users/me`,
    patch: `${env}/users/me`,
    get: `${env}/users/me`
  },

  dailyIntake: {
    get: `${env}/daily-intakes?date={}`
  },

  foodConsumption: {
    get: `${env}/food-consumptions`,
    post: `${env}/food-consumptions`,
    put: `${env}/food-consumptions/{}`,
    delete: `${env}/food-consumptions/{}`
  },

  food: {
    get: `${env}/foods`,
    getById: `${env}/foods/{}`,
    post: `${env}/foods`,
    patch: `${env}/foods/{}`,
    delete: `${env}/foods/{}`
  },

  resolve(path: string, ...args: (string | number)[]): string {
    let resolved = path;
    for (const arg of args) {
      resolved = resolved.replace('{}', String(arg));
    }
    return resolved;
  }
};
