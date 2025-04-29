export interface Review {
  id: string;
  rating: number;
  comment: string;
  serviceId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  service?: any; // You can define a more specific type for the service
  user?: any; // You can define a more specific type for the user
} 