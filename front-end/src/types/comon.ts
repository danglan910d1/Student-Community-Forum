export type Variant =
  | "primary"
  | "primary-light"
  | "secondary"
  | "secondary-light"
  | "tertiary"
  | "tertiary-light"
  | "default"
  | "link";

export type Size = "sm" | "md" | "lg" | "icon";

export interface ColorDefinition {
  role: string;
  intensity: string;
  class: string;
  hex: string;
  text: string;
  hover: boolean;
  usage: string;
}
