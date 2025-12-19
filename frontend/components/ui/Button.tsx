import { Text, Pressable, type PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  disabled = false,
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-lg items-center justify-center';
  
  const variantStyles = {
    primary: disabled ? 'bg-gray-400' : 'bg-primary active:bg-primary-dark',
    secondary: disabled ? 'bg-gray-400' : 'bg-navy active:opacity-90',
    outline: disabled ? 'border-2 border-gray-400' : 'border-2 border-primary active:bg-primary-light/10',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };
  
  const textStyles = {
    primary: disabled ? 'text-gray-200 font-semibold' : 'text-white font-semibold',
    secondary: disabled ? 'text-gray-200 font-semibold' : 'text-white font-semibold',
    outline: disabled ? 'text-gray-400 font-semibold' : 'text-primary-dark font-semibold',
  };
  
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Check if children is a string to wrap in Text
  const isString = typeof children === 'string';

  return (
    <Pressable
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      disabled={disabled}
      {...props}
    >
      {isString ? (
        <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}