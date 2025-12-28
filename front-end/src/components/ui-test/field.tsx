"use client";

import * as React from "react";
import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// --- FieldSet ---
const FieldSet = React.forwardRef<
  React.ComponentRef<"fieldset">,
  React.ComponentPropsWithoutRef<"fieldset">
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    data-slot="field-set"
    className={cn(
      "flex flex-col gap-6",
      "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
      className
    )}
    {...props}
  />
));
FieldSet.displayName = "FieldSet";

// --- FieldLegend ---
const FieldLegend = React.forwardRef<
  React.ComponentRef<"legend">,
  React.ComponentPropsWithoutRef<"legend"> & { variant?: "legend" | "label" }
>(({ className, variant = "legend", ...props }, ref) => (
  <legend
    ref={ref}
    data-slot="field-legend"
    data-variant={variant}
    className={cn(
      "mb-3 font-medium tracking-tight",
      "data-[variant=legend]:text-base",
      "data-[variant=label]:text-sm",
      className
    )}
    {...props}
  />
));
FieldLegend.displayName = "FieldLegend";

// --- FieldGroup ---
const FieldGroup = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn(
      "group/field-group @container/field-group flex w-full flex-col gap-7",
      "data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
      className
    )}
    {...props}
  />
));
FieldGroup.displayName = "FieldGroup";

// --- Field ---
const fieldVariants = cva(
  "group/field data-[invalid=true]:text-destructive flex w-full gap-3",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-start sm:items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start",
        ],
        responsive: [
          "@md/field-group:flex-row @md/field-group:items-center flex-col [&>*]:w-full @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
);

const Field = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & VariantProps<typeof fieldVariants>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    data-slot="field"
    data-orientation={orientation}
    className={cn(fieldVariants({ orientation }), className)}
    {...props}
  />
));
Field.displayName = "Field";

// --- FieldContent ---
const FieldContent = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn(
      "group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
      className
    )}
    {...props}
  />
));
FieldContent.displayName = "FieldContent";

// --- FieldLabel ---
const FieldLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    data-slot="field-label"
    className={cn(
      "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
      "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4",
      "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
      className
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

// --- FieldTitle ---
const FieldTitle = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-title"
    className={cn(
      "flex w-fit items-center gap-2 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50",
      className
    )}
    {...props}
  />
));
FieldTitle.displayName = "FieldTitle";

// --- FieldDescription ---
const FieldDescription = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn(
      "text-muted-foreground text-sm font-normal leading-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
      "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
      className
    )}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

// --- FieldSeparator ---
const FieldSeparator = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-separator"
    data-content={!!children}
    className={cn(
      "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
      className
    )}
    {...props}
  >
    <Separator className="absolute inset-0 top-1/2" />
    {children && (
      <span
        className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
        data-slot="field-separator-content"
      >
        {children}
      </span>
    )}
  </div>
));
FieldSeparator.displayName = "FieldSeparator";

// --- FieldError ---
const FieldError = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    errors?: Array<{ message?: string } | undefined>;
  }
>(({ className, children, errors, ...props }, ref) => {
  const content = useMemo(() => {
    if (children) return children;
    if (!errors?.length) return null;

    const messages = errors.filter((e) => !!e?.message);
    if (messages.length === 0) return null;

    if (messages.length === 1) return messages[0]?.message;

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {messages.map((error, index) => (
          <li key={index}>{error?.message}</li>
        ))}
      </ul>
    );
  }, [children, errors]);

  if (!content) return null;

  return (
    <div
      ref={ref}
      role="alert"
      data-slot="field-error"
      className={cn(
        "text-destructive text-sm font-medium animate-in fade-in-50 slide-in-from-top-1",
        className
      )}
      {...props}
    >
      {content}
    </div>
  );
});
FieldError.displayName = "FieldError";

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
