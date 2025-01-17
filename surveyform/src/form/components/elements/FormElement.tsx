import React, { HTMLAttributes, PropsWithChildren } from "react";
import { useFormContext } from "@devographics/react-form";

export type FormElementProps = HTMLAttributes<HTMLFormElement>;
/**
 * The actual wrapper of the form
 */
export const FormElement = React.forwardRef<HTMLFormElement>(
  function FormElement(
    { children, ...otherProps }: PropsWithChildren<FormElementProps>,
    ref
  ) {
    return (
      <form {...otherProps} ref={ref}>
        {children}
      </form>
    );
  }
);
