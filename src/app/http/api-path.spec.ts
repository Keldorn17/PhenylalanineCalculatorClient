import {describe, it, expect} from 'vitest';
import {ApiPath} from './api-path';

describe('ApiPath', () => {
  it('should resolve placeholders with arguments', () => {
    const resolved = ApiPath.resolve('http://localhost:8080/api/v1/food-types/{}', 42);
    expect(resolved).toBe('http://localhost:8080/api/v1/food-types/42');
  });

  it('should resolve multiple placeholders in order', () => {
    const resolved = ApiPath.resolve('/users/{}/items/{}', 'alice', 10);
    expect(resolved).toBe('/users/alice/items/10');
  });
});
