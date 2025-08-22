'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps, FormProvider } from 'react-hook-form';
import { z } from 'zod';

interface FormProps<TFormValues extends Record<string, unknown>>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  schema: z.ZodType<TFormValues>;
  onSubmit: (values: TFormValues) => void;
  children: React.ReactNode;
  options?: UseFormProps<TFormValues>;
}

export const Form = <TFormValues extends Record<string, any>>({
  schema,
  onSubmit,
  children,
  options,
  ...props
}: FormProps<TFormValues>) => {
  const methods = useForm<TFormValues>({
    resolver: zodResolver(schema as any),
    ...options,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
};
