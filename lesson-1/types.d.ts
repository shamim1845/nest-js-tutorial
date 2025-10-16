export interface ApiResponse {
  message: string;
  statusCode: number;
  data?: any;
  error?: string;
  metadata?: {
    meta: Paginated<T>;
    links: Paginated<T>['links'];
  };
}

export interface JWT_User_Payload {
  sub: number;
  email: string;
}
