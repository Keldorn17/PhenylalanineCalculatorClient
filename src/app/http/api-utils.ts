import {HttpParams} from '@angular/common/http';
import {ApiQueryParams} from './api-types';

/**
 * Builds HttpParams from standard ApiQueryParams for pagination and RSQL.
 * @param params The combined query parameters (page, size, query, sort)
 */
export function buildQueryParams(params: ApiQueryParams): HttpParams {
  let httpParams = new HttpParams();

  if (params.page !== undefined && params.page !== null) {
    httpParams = httpParams.set('page', String(params.page));
  }
  if (params.size !== undefined && params.size !== null) {
    httpParams = httpParams.set('size', String(params.size));
  }
  if (params.query) {
    httpParams = httpParams.set('query', params.query);
  }
  if (params.sort) {
    httpParams = httpParams.set('sort', params.sort);
  }

  return httpParams;
}

/**
 * A type-safe builder for RSQL query strings.
 */
export class RsqlBuilder {
  private readonly parts: string[] = [];

  /**
   * Factory method to create a new RsqlBuilder instance.
   */
  public static create(): RsqlBuilder {
    return new RsqlBuilder();
  }

  /**
   * Field equals value (==)
   */
  public eq(field: string, value: string | number): this {
    const formatted = typeof value === 'string' ? `'${value}'` : value;
    this.parts.push(`${field}==${formatted}`);
    return this;
  }

  /**
   * Field not equals value (!=)
   */
  public ne(field: string, value: string | number): this {
    const formatted = typeof value === 'string' ? `'${value}'` : value;
    this.parts.push(`${field}!=${formatted}`);
    return this;
  }

  /**
   * Field less than value (=lt=)
   */
  public lt(field: string, value: number): this {
    this.parts.push(`${field}=lt=${value}`);
    return this;
  }

  /**
   * Field greater than value (=gt=)
   */
  public gt(field: string, value: number): this {
    this.parts.push(`${field}=gt=${value}`);
    return this;
  }

  /**
   * Field contains case-insensitive string (=ilike=)
   */
  public ilike(field: string, value: string): this {
    this.parts.push(`${field}=ilike='${value}'`);
    return this;
  }

  /**
   * AND operator (and)
   */
  public and(): this {
    this.parts.push('and');
    return this;
  }

  /**
   * OR operator (or)
   */
  public or(): this {
    this.parts.push('or');
    return this;
  }

  /**
   * Builds the final RSQL query string.
   */
  public build(): string {
    return this.parts.join(' ');
  }
}
