export interface UserRequest {
  dailyLimit: number;
}

export interface UserResponse {
  username: string;
  dailyLimit: number | null;
}
