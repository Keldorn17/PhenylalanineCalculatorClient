import {describe, it, expect} from 'vitest';
import {buildQueryParams, RsqlBuilder} from './api-utils';

describe('ApiUtils', () => {
  describe('buildQueryParams', () => {
    it('should correctly map page, size, query, and sort', () => {
      const params = buildQueryParams({
        page: 0,
        size: 20,
        query: 'name==apple',
        sort: 'name,asc',
      });

      expect(params.get('page')).toBe('0');
      expect(params.get('size')).toBe('20');
      expect(params.get('query')).toBe('name==apple');
      expect(params.get('sort')).toBe('name,asc');
    });

    it('should ignore undefined values', () => {
      const params = buildQueryParams({});
      expect(params.keys().length).toBe(0);
    });
  });

  describe('RsqlBuilder', () => {
    it('should construct correct RSQL query with operators', () => {
      const query = RsqlBuilder.create()
        .eq('status', 'ACTIVE')
        .and()
        .gt('amount', 50)
        .build();

      expect(query).toBe("status=='ACTIVE' and amount=gt=50");
    });

    it('should support ilike and or', () => {
      const query = RsqlBuilder.create()
        .ilike('name', 'apple')
        .or()
        .lt('phenylalanine', 10)
        .build();

      expect(query).toBe("name=ilike='apple' or phenylalanine=lt=10");
    });
  });
});
