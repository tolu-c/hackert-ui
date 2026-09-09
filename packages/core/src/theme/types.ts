export interface AppTheme {
  readonly colors: AppColorTheme;
  readonly radius: AppRadiusTheme;
  readonly spacing: AppSpacingTheme;
  readonly fontFamily: string;
}

export interface AppThemeOverride {
  readonly colors?: Partial<AppColorTheme>;
  readonly radius?: Partial<AppRadiusTheme>;
  readonly spacing?: Partial<AppSpacingTheme>;
  readonly fontFamily?: string;
}

export interface AppColorTheme {
  readonly primary: string;
  readonly secondary: string;
  readonly success: string;
  readonly danger: string;
  readonly warning: string;
}

export interface AppRadiusTheme {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly "2xl": string;
}

export interface AppSpacingTheme {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly "2xl": string;
}
