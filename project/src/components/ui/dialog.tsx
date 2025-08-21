import * as React from "react";
import { X } from "lucide-react";

export const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto relative border border-gray-100">
        {children}
        <button
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = "" }: any) => (
  <div className={`p-6 pr-12 ${className}`}>{children}</div>
);

export const DialogHeader = ({ children }: any) => (
  <div className="mb-6">{children}</div>
);

export const DialogTitle = ({ children }: any) => (
  <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
);

export const DialogFooter = ({ children }: any) => (
  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">{children}</div>
);
