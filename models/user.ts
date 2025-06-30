export interface User {
  id: number;
  email: string;
  nickname: string;
  name?: string;
  lastName?: string;
  address?: string;
  avatar?: string;
  userType: 'User' | 'Student' | 'Admin';
  enabled: 'Yes' | 'No';
} 