import APP_CONFIG from '../../../public/config.json';

const env = `${APP_CONFIG.apiHost}${APP_CONFIG.apiPrefix}`;

export const ApiPath = {
  auth: {
    authenticate: `${env}/auth/authenticate`,
    refresh: `${env}/auth/refresh`,
    logout: `${env}/auth/logout`,
    register: `${env}/auth/register`
  },

  foodTypes: {
    get: `${env}/food-types`,
    getById: `${env}/food-types/{}`
  },

  /**
   * Helper utility to resolve path placeholders like '{}' with IDs or values.
   * Example: ApiPath.resolve(ApiPath.foodTypes.get, 1) -> http://localhost:8080/api/v1/food-types/1
   *
   * @param path The templated path string containing '{}'
   * @param args The arguments to replace each '{}' placeholder in order
   */
  resolve(path: string, ...args: (string | number)[]): string {
    let resolved = path;
    for (const arg of args) {
      resolved = resolved.replace('{}', String(arg));
    }
    return resolved;
  }
};
