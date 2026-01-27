export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  document_type: string;
  document_number: string;
  phone_number: string;
  type_person?: string;
  gender?: string;
}

export interface SelectProviderResponse {
  result: {
    authorization: any;
    temp_token: string;
  };
}

export interface ValidateLoginResponse {
  result: {
    access_token: string;
    user: User;
  };
}
