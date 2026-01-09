// modules/post/components/PostForm/PostFormHeader.tsx
interface PostFormHeaderProps {
  title: string;
  description: string;
}

export function PostFormHeader({ title, description }: PostFormHeaderProps) {
  return (
    <header className="mb-8 space-y-2">
      <h1 className="text-title text-2xl font-bold tracking-tight uppercase">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}
