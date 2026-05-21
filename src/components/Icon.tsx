type IconProps = {
  src: string;
  className?: string;
};

export const Icon = ({ src, className = 'h-4 w-4' }: IconProps) => (
  <span
    aria-hidden
    className={`inline-flex shrink-0 [&>svg]:h-full [&>svg]:w-full ${className}`}
    dangerouslySetInnerHTML={{ __html: src }}
  />
);
