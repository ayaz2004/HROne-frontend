import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'default';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'default', ...props }, ref) => {
    const baseClass = 'button';
    const variantClass = `button-${variant}`;
    const sizeClass = size === 'sm' ? 'button-sm' : '';
    
    const classes = [baseClass, variantClass, sizeClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
