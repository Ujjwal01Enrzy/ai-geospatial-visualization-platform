import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[90vw]",
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm animate-fade-in" />
        <DialogPrimitive.Content
          className={`fixed z-modal top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-full ${sizeClasses[size]} ${className}
            card p-0 animate-slide-up max-h-[90vh] flex flex-col`}
        >
          {/* Header */}
          <div className="panel-header shrink-0">
            <div>
              {title && (
                <DialogPrimitive.Title className="text-h3 font-semibold text-neutral-900 dark:text-neutral-50">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="text-body-sm text-neutral-600 dark:text-neutral-400 mt-4">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="btn-icon">
              <X className="w-20 h-20" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Content */}
          <div className="p-24 overflow-y-auto custom-scrollbar flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-24 py-16 border-t border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-end gap-12">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Modal;
