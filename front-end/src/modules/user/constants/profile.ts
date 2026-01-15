import {
  PasswordFormValues,
  ProfileFormValues,
} from "../schemas/profileSchema";

export interface IFormField<T> {
  name: keyof T;
  label: string;
  placeholder: string;
  type?: string;
  editable?: boolean;
}

export const PROFILE_FIELDS: IFormField<ProfileFormValues>[] = [
  {
    name: "name",
    label: "Họ và tên",
    placeholder: "Nhập họ tên...",
    editable: true,
  },
  {
    name: "email",
    label: "Địa chỉ Email",
    placeholder: "email@example.com",
    editable: false,
  },
  {
    name: "avatar",
    label: "Ảnh đại diện",
    placeholder: "Chọn ảnh...",
    editable: true,
  },
];

export const PASSWORD_FIELDS = [
  { name: "oldPassword", label: "Mật khẩu hiện tại", placeholder: "••••••••" },
  { name: "newPassword", label: "Mật khẩu mới", placeholder: "••••••••" },
  {
    name: "confirmPassword",
    label: "Xác nhận mật khẩu mới",
    placeholder: "••••••••",
  },
] as const;

export const PROFILE_TABS = [
  { value: "profile", label: "Hồ sơ công khai" },
  { value: "password", label: "Mật khẩu & Bảo mật" },
];
