import React from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

let alertRoot = null;
let alertContainer = null;

const createContainer = () => {
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'oxy-alert-container';
    // Necesitamos asegurarnos de que herede el tema oscuro si está en html/body
    document.body.appendChild(alertContainer);
    alertRoot = createRoot(alertContainer);
  }
};

const CustomDialog = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={type === 'alert' ? onConfirm : onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col items-center text-center gap-3 mt-2">
              <div className={`p-4 rounded-full ${type === 'alert' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                {type === 'alert' ? <AlertCircle className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-4">
              {type === 'confirm' && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full font-semibold border-border/50 hover:bg-muted/50 h-12"
                  onClick={onCancel}
                >
                  {t('common.cancel')}
                </Button>
              )}
              <Button
                className={`flex-1 rounded-full font-bold h-12 shadow-lg ${type === 'alert' ? 'w-full' : ''}`}
                onClick={onConfirm}
              >
                {t('common.confirm')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const oxyAlert = (message, title = "Aviso") => {
  return new Promise((resolve) => {
    createContainer();

    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    if (isDark) alertContainer.classList.add('dark');
    else alertContainer.classList.remove('dark');

    const handleClose = () => {
      render(false);
      setTimeout(() => resolve(true), 300);
    };

    const render = (isOpen) => {
      alertRoot.render(
        <CustomDialog
          isOpen={isOpen}
          type="alert"
          title={title}
          message={message}
          onConfirm={handleClose}
        />
      );
    };

    render(true);
  });
};

export const oxyConfirm = (message, title = "Confirmar") => {
  return new Promise((resolve) => {
    createContainer();

    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    if (isDark) alertContainer.classList.add('dark');
    else alertContainer.classList.remove('dark');

    const handleConfirm = () => {
      render(false);
      setTimeout(() => resolve(true), 300);
    };

    const handleCancel = () => {
      render(false);
      setTimeout(() => resolve(false), 300);
    };

    const render = (isOpen) => {
      alertRoot.render(
        <CustomDialog
          isOpen={isOpen}
          type="confirm"
          title={title}
          message={message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );
    };

    render(true);
  });
};
