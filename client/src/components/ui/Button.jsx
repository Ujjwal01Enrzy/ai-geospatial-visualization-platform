import React from "react";
import { Loader2 } from "lucide-react";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      ghost: "btn-ghost",
      icon: "btn-icon",
    };

    const sizeClasses = {
      sm: "px-12 py-6 text-body-sm",
      md: "px-16 py-8 text-body",
      lg: "px-24 py-12 text-h4",
    };

    const baseClass = variantClasses[variant] || variantClasses.primary;
    const sizeClass = variant !== "icon" ? sizeClasses[size] : "";
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClass} ${sizeClass} ${widthClass} ${className} inline-flex items-center justify-center gap-8`}
        {...props}
      >
        {loading && <Loader2 className="w-16 h-16 animate-spin" />}
        {!loading && Icon && iconPosition === "left" && (
          <Icon className="w-16 h-16" />
        )}
        {children}
        {!loading && Icon && iconPosition === "right" && (
          <Icon className="w-16 h-16" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
