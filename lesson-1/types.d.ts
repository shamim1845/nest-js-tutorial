export interface ApiResponse {
  message: string;
  statusCode: number;
  data?: any;
  error?: string;
}

export type User = {
  id: number;
  name: string;
  age: number;
  gender?: string;
  isMarried: boolean;
  email: string;
  password: string;
};
