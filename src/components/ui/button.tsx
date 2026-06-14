"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/button-variants";

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants>;

const Button = ({
  className,
  variant,
  size,
  ...props
}: ButtonProps) => {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
