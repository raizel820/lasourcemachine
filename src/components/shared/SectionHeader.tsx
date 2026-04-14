import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-10 max-w-2xl',
        centered && 'mx-auto text-center',
        className
      )}
    >
      <h2
        className={cn(
          'text-3xl font-bold tracking-tight sm:text-4xl',
          'after:mt-3 after:block after:h-1 after:w-16 after:rounded-full after:bg-primary',
          centered && 'after:mx-auto'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
