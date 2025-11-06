export function Loader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/50 border-t-primary" />
      {text && <p className="text-lg font-medium text-foreground">{text}</p>}
    </div>
  );
}
