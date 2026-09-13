import type { CSSProperties, ReactNode } from 'react';
import s from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '6px',
  dark = false,
  className = '',
  style,
}: SkeletonProps) => {
  const inlineStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...style,
  };

  return (
    <span
      className={`${dark ? s.skeletonDark : s.skeleton} ${className}`}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
};
