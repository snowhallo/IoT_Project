import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const switchRootVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transitio-visible:rn-colors focus-visible:outline-none focusing-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const switchThumbVariants = cva(
  'pointer-events-none flex items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-7',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export default function Switch({ checked, onChange, disabled = false, loading = false, size = 'md', className }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled || loading}
      className={cn(
        switchRootVariants({ size }),
        loading && 'opacity-80 cursor-wait',
        className
      )}
    >
      <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ size }))}>
        {loading && (
          <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

