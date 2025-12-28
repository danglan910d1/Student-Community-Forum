import { cn } from "@/lib/utils";

export function CenteredContainer({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}
