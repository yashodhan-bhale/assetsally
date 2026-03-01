"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { ScheduleForm } from "./ScheduleForm";

interface AuditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date | null;
  initialLocationId?: string | null;
  readOnly?: boolean;
}

export function AuditScheduleModal({
  isOpen,
  onClose,
  initialDate,
  initialLocationId,
  readOnly = false,
}: AuditScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="text-lg font-bold text-slate-900">
              {readOnly ? "View Audit Details" : "Schedule Audit"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <ScheduleForm
              initialDate={initialDate}
              initialLocationId={initialLocationId}
              onSuccess={() => {
                onClose();
              }}
              onCancel={onClose}
              readOnly={readOnly}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
