type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  large?: boolean;
};

export function ScreenHeader({ title, subtitle, action, large }: Props) {
  return (
    <header className="screen-header">
      <div className="min-w-0 flex-1">
        <h1 className={large ? "screen-title-large" : "screen-title"}>{title}</h1>
        {subtitle && <p className="screen-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
