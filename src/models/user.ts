export interface ValueLabel {
  value: string;
  label: string;
  type?: string;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  phone: string;
  department: ValueLabel | null;
  status: ValueLabel;
  roles: ValueLabel[];
  administrative_position: ValueLabel | null;
  medical_position: ValueLabel | null;
  is_simple_digital_sign_enabled: boolean;
  created_at: number;
  updated_at: number;
  hired_at: number;
  fired_at: number | null;
  email_verified_at: number | null;
}

export interface CreateUserDto {
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  phone: string;
  department?: string | null;
  administrative_position?: string | null;
  medical_position?: string | null;
  is_simple_digital_sign_enabled: boolean;
  hired_at: number;
}

export interface UpdateUserDto extends CreateUserDto {}

export interface UsersResponse {
  message: string;
  data: {
    pagination: {
      page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
    items: User[];
  };
}

export interface UserResponse {
  message: string;
  data: User;
}