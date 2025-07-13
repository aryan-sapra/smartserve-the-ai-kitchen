import type { SVGProps } from 'react';

export function SmartServeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fontFamily="var(--font-geist-sans)"
        fill="hsl(var(--primary-foreground))"
      >
        S
      </text>
    </svg>
  );
}
