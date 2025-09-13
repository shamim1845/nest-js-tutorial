export interface ApiResponse {
  message: string;
  statusCode: number;
  data?: any;
  error?: string;
}

export interface JWT_User_Payload {
  sub: number;
  email: string;
}
