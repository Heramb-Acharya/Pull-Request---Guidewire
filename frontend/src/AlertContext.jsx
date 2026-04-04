import { createContext, useContext, useState } from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState(null);

  // alertConfig structure: { message: string, showOk: boolean, okText: string, onOk?: function }
  const showAlert = (message, options = {}) => {
    setAlertConfig({
      message,
      showOk: options.showOk ?? false,
      okText: options.okText ?? 'OK',
      onOk: options.onOk,
    });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      
      {/* Modal Overlay */}
      {alertConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg border border-border/50 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-scale-in text-center relative overflow-hidden">
            {/* Subtle top glare/gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-50" />
            
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              {alertConfig.showOk ? (
                 <AlertCircle className="w-6 h-6 text-primary" />
              ) : (
                 <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
              )}
            </div>
            
            <div className="text-lg font-semibold text-slate-200 mb-6">
              {alertConfig.message}
            </div>
            
            {alertConfig.showOk ? (
              <button
                onClick={() => {
                  if (alertConfig.onOk) alertConfig.onOk();
                  hideAlert();
                }}
                className="w-full btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {alertConfig.okText}
              </button>
            ) : (
              <div className="flex justify-center mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
