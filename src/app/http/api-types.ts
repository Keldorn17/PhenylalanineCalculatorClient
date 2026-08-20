export interface PageParams {
  page?: number;
  size?: number;
}

export interface RsqlParams {
  query?: string;
  sort?: string;
}

export interface ApiQueryParams extends PageParams, RsqlParams {
}

export interface PageResponse {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: PageResponse;
}
