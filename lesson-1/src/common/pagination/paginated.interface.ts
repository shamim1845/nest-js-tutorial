export interface Paginated<T> {
  data: T[];
  metadata: {
    meta: {
      itemsPerPage: number;
      totalItems: number;
      currentPage: number;
      totalPages: number;
    };
    links: {
      first: string;
      last: string;
      current: string;
      next: string;
      previous: string;
    };
  };
}
