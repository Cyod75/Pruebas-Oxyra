import React, { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { 
    IconCrown, 
    IconAlertTriangle, 
    IconX,
} from "../../icons/Icons"; 
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import { API_URL } from '../../../config/api';
import { useTheme } from '../../../context/ThemeContext';
import OxyraLogo from '../../shared/OxyraLogo';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_aqui_tu_clave_publica_de_prueba');

// Card brand logos as inline SVG components
const VisaIcon = () => (
  <svg viewBox="0 0 48 16" className="w-9 h-5" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="16" rx="2" fill="#1A1F71"/>
    <text x="50%" y="12" dominantBaseline="auto" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Arial">VISA</text>
  </svg>
);
const McIcon = () => (
  <svg viewBox="0 0 38 24" className="w-8 h-5" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="12" r="10" fill="#EB001B"/>
    <circle cx="24" cy="12" r="10" fill="#F79E1B"/>
    <path d="M19 5.27A10 10 0 0 1 23 12 10 10 0 0 1 19 18.73 10 10 0 0 1 15 12 10 10 0 0 1 19 5.27Z" fill="#FF5F00"/>
  </svg>
);
const GenericCardIcon = () => (
  <svg viewBox="0 0 32 24" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" rx="3" fill="currentColor" className="text-secondary"/>
    <rect x="0" y="7" width="32" height="5" fill="currentColor" className="text-muted-foreground/30"/>
    <rect x="4" y="15" width="8" height="3" rx="1" fill="currentColor" className="text-muted-foreground/40"/>
  </svg>
);

export default function SubscriptionSheet({ open, onOpenChange, isPro, daysLeft, loading, onSubscribe, onCancel }) {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const [viewState, setViewState] = useState("benefits");
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [fetchingSecret, setFetchingSecret] = useState(false);
  const [subInfo, setSubInfo] = useState(null);
  const [fetchingSubInfo, setFetchingSubInfo] = useState(false);

  useEffect(() => {
      if(open) {
          const nextView = isPro ? "active" : "benefits";
          setViewState(nextView);
          setShowStripeModal(false);
          document.body.style.overflow = 'hidden';
          if(isPro) fetchSubInfo();
      } else {
          document.body.style.overflow = 'unset';
          setTimeout(() => {
              setViewState("init");
              setShowStripeModal(false);
              setClientSecret(""); // IMPORTANT: Reset secret on close to avoid stale stripe requests
          }, 300);
      }
      return () => { document.body.style.overflow = 'unset'; }
  }, [open, isPro]);

  const fetchSubInfo = async () => {
      if (fetchingSubInfo) return;
      setFetchingSubInfo(true);
      try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(`${API_URL}/api/payments/subscription-info`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setSubInfo(data);
          }
      } catch (e) {
          console.error("Error fetching sub info:", e);
      } finally {
          setFetchingSubInfo(false);
      }
  };

  useEffect(() => {
      if(open && showStripeModal && !clientSecret && !fetchingSecret) {
          fetchPaymentIntent();
      }
  }, [open, showStripeModal, clientSecret]);

  const fetchPaymentIntent = async () => {
      if (fetchingSecret) return;
      setFetchingSecret(true);
      try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(`${API_URL}/api/payments/create-payment-intent`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if(data.clientSecret) {
              setClientSecret(data.clientSecret);
          } else {
             console.error("No clientSecret received:", data);
          }
      } catch (e) {
          console.error("Error pidiendo stripe intent:", e);
      } finally {
          setFetchingSecret(false);
      }
  };

  if (!open) return null;

  const renderBenefits = () => (
      <div className={`flex flex-col h-full overflow-y-auto pb-36 px-5 sm:px-6 animate-in fade-in zoom-in-95 duration-500 transition-all ${showStripeModal ? 'scale-95 blur-md opacity-40' : ''}`}>
          
          <div className="flex justify-between items-center pt-8 pb-2">
              <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-secondary/50">
                  <IconX className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 opacity-90">
                  <OxyraLogo className="h-[18px] w-auto text-foreground" />
                  <span className="bg-foreground text-background text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest shadow-md">PRO</span>
              </div>
          </div>

          <h1 className="text-3xl sm:text-[32px] leading-tight font-extrabold text-center text-foreground mt-2 mb-6 tracking-tight">
              <Trans
                i18nKey="subscription.title"
                components={{
                  0: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400" />,
                  br: <br />
                }}
              />
          </h1>

          <div className="bg-card/40 backdrop-blur-3xl border border-border/60 rounded-[30px] p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-50"></div>

              <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[24px] shadow-inner border border-blue-500/20 shrink-0">📅</div>
                  <div className="pt-0.5">
                      <h3 className="font-bold text-foreground text-[15px] sm:text-[16px] tracking-tight">{t("subscription.plan_personalised")}</h3>
                      <p className="text-muted-foreground text-[13px] sm:text-[14px] mt-1 leading-snug">{t("subscription.plan_personalised_sub")}</p>
                  </div>
              </div>

              <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-[24px] shadow-inner border border-cyan-500/20 shrink-0">🏋️</div>
                  <div className="pt-0.5">
                      <h3 className="font-bold text-foreground text-[15px] sm:text-[16px] tracking-tight">{t("subscription.scan_body")}</h3>
                      <p className="text-muted-foreground text-[13px] sm:text-[14px] mt-1 leading-snug">{t("subscription.scan_body_sub")}</p>
                  </div>
              </div>

              {/* ⭐ Destacamos este beneficio más que los demás con un fondo especial y bordes */}
              <div className="flex gap-4 items-start relative bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4 -m-4 rounded-2xl border border-blue-500/10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-[24px] shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/30 shrink-0">✨</div>
                  <div className="pt-0.5">
                      <h3 className="font-extrabold text-foreground text-[15px] sm:text-[16px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{t("subscription.generate_workouts")}</h3>
                      <p className="text-muted-foreground text-[13px] sm:text-[14px] mt-1 leading-snug">{t("subscription.generate_workouts_sub")}</p>
                  </div>
              </div>

          </div>
      </div>
  );

  const renderStripeOverlay = () => {
      if (!showStripeModal) return null;

      return (
          <div className="absolute inset-0 z-50 flex flex-col justify-end sm:justify-center p-2 sm:p-6 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowStripeModal(false)} />
              
              <div className="relative z-10 w-full max-w-lg mx-auto bg-card/60 backdrop-blur-3xl border border-border/50 rounded-t-[36px] sm:rounded-[36px] shadow-[0_20px_60px_rgb(0,0,0,0.3)] pb-8 pt-2 px-4 sm:p-8 animate-in slide-in-from-bottom-1/2 sm:zoom-in-95 duration-500 ease-out overflow-hidden hidden-scrollbar" style={{maxHeight:'90vh', overflowY:'auto'}}>
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
                  
                  <div className="w-12 h-1.5 bg-foreground/20 rounded-full mx-auto mb-6 sm:hidden" />

                  <div className="flex items-center justify-between mb-6 px-2">
                       <button onClick={() => setShowStripeModal(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-secondary/80">
                           <IconX className="w-6 h-6" />
                       </button>
                       <span className="text-xl font-bold text-foreground mx-auto pr-8">{t("subscription.secure_payment")}</span>
                   </div>

                   <div className="w-full">
                       {fetchingSecret ? (
                           <div className="py-24 flex flex-col items-center justify-center space-y-4">
                               <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                               <p className="text-muted-foreground text-base font-medium">{t("subscription.initializing_gateway")}</p>
                           </div>
                       ) : clientSecret ? (
                           <Elements stripe={stripePromise} options={{ 
                               clientSecret,
                               appearance: {
                                   theme: isDark ? 'night' : 'stripe',
                                   variables: {
                                       colorPrimary: '#3b82f6',
                                       colorBackground: isDark ? '#141416' : '#ffffff',
                                       colorText: isDark ? '#ffffff' : '#000000',
                                       colorDanger: '#ef4444',
                                       borderRadius: '16px',
                                       gridRowSpacing: '28px',
                                       spacingUnit: '6px',
                                   },
                                   rules: {
                                       '.Input': {
                                           backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                           borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                           boxShadow: 'none',
                                           padding: '16px 18px',
                                           fontSize: '16px',
                                       },
                                       '.Input:focus': {
                                           borderColor: '#3b82f6',
                                           boxShadow: '0 0 0 1px #3b82f6',
                                       },
                                       '.Label': {
                                           fontWeight: '600',
                                           color: isDark ? '#E5E7EB' : '#374151',
                                           marginBottom: '10px',
                                           fontSize: '15px',
                                       },
                                       '.Tab': {
                                           backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                           borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                           padding: '12px',
                                       },
                                       '.Tab--selected': {
                                           backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                                           borderColor: '#3b82f6',
                                           color: isDark ? '#ffffff' : '#000000',
                                       }
                                   }
                               } 
                           }}>
                               <StripeCheckoutForm 
                                   onSuccess={() => {
                                       onSubscribe({}, () => onOpenChange(false));
                                   }}
                                   onCancel={() => setShowStripeModal(false)}
                               />
                           </Elements>
                       ) : (
                           <div className="py-12 text-center bg-destructive/10 backdrop-blur-md rounded-[24px] border border-destructive/20 mt-4">
                               <IconAlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                               <p className="text-base text-destructive font-semibold">{t("subscription.server_error")}</p>
                           </div>
                       )}
                   </div>
              </div>
          </div>
      );
  };

  const renderActive = () => {
      // Derive display info — prefer live Stripe data, fallback to props
      const cardBrand = subInfo?.paymentMethod?.brand || null;
      const cardLast4 = subInfo?.paymentMethod?.last4 || '4242';
      const renewalDate = subInfo?.currentPeriodEnd
          ? new Date(subInfo.currentPeriodEnd * 1000).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
          : null;
      const interval = subInfo?.plan?.interval === 'year' ? t("subscription.yearly") : t("subscription.monthly");
      const price = subInfo?.plan?.amount ? (subInfo.plan.amount / 100).toFixed(2) : '9.99';
      const currency = (subInfo?.plan?.currency || 'eur').toUpperCase();
      const currencySymbol = currency === 'EUR' ? '€' : '$';

      const CardIcon = cardBrand === 'visa' ? VisaIcon : cardBrand === 'mastercard' ? McIcon : GenericCardIcon;

      return (
        <div className="flex flex-col h-full overflow-y-auto animate-in fade-in duration-400">
            {/* Header */}
            <div className="flex items-center px-5 pt-12 pb-5">
                <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-xl hover:bg-secondary/60 transition-colors">
                    <IconX className="w-5 h-5" />
                </button>
                <h2 className="text-[17px] font-semibold text-foreground mx-auto pr-7">{t("subscription.subscription_title")}</h2>
            </div>

            {/* Plan header block */}
            <div className="px-5 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <OxyraLogo className="h-[30px] w-auto text-foreground" />
                            <span className="text-[24px] font-bold tracking-tight text-foreground leading-none">Pro</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest ml-1">{t("subscription.active")}</span>
                        </div>
                        <p className="text-muted-foreground text-[14px]">
                            <span className="text-foreground font-semibold">{price}{currencySymbol}</span> / {interval}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info sections */}
            <div className="px-5 space-y-2">

                {/* Billing section */}
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">{t("subscription.billing")}</p>
                <div className="bg-secondary/30 rounded-2xl overflow-hidden border border-border/30">
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-[14px] text-muted-foreground">{t("subscription.next_billing")}</span>
                        <span className="text-[14px] font-semibold text-foreground">
                            {price}{currencySymbol}
                        </span>
                    </div>
                    <div className="h-px bg-border/30 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-[14px] text-muted-foreground">{t("subscription.renewal_date")}</span>
                        <span className="text-[14px] font-medium text-foreground">
                            {renewalDate || (daysLeft > 0 ? t("subscription.in_days", { days: daysLeft }) : t("subscription.not_defined"))}
                        </span>
                    </div>
                    <div className="h-px bg-border/30 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-[14px] text-muted-foreground">{t("subscription.billing_cycle")}</span>
                        <span className="text-[14px] font-medium text-foreground capitalize">{interval}</span>
                    </div>
                </div>

                {/* Payment section */}
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1 pt-3">{t("subscription.payment")}</p>
                <div className="bg-secondary/30 rounded-2xl overflow-hidden border border-border/30">
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-[14px] text-muted-foreground">{t("subscription.payment_method")}</span>
                        <div className="flex items-center gap-2.5">
                            <CardIcon />
                            <span className="text-[14px] font-medium text-foreground">•••• {cardLast4}</span>
                        </div>
                    </div>
                    {subInfo?.paymentMethod?.expMonth && (
                        <>
                            <div className="h-px bg-border/30 mx-4" />
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <span className="text-[14px] text-muted-foreground">{t("subscription.expires")}</span>
                                <span className="text-[14px] font-medium text-foreground">
                                    {String(subInfo.paymentMethod.expMonth).padStart(2,'0')}/{String(subInfo.paymentMethod.expYear).slice(-2)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Status section */}
                <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1 pt-3">{t("subscription.status")}</p>
                <div className="bg-secondary/30 rounded-2xl overflow-hidden border border-border/30">
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-[14px] text-muted-foreground">{t("subscription.auto_renewal")}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[14px] font-medium text-emerald-500">{t("subscription.activated")}</span>
                        </div>
                    </div>
                    <div className="h-px bg-border/30 mx-4" />
                    <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-[14px] text-muted-foreground">{t("subscription.anti_fraud")}</span>
                        <span className="text-[14px] font-medium text-foreground">Stripe Secure</span>
                    </div>
                </div>
            </div>

            {/* Cancel button */}
            <div className="px-5 pb-10 pt-8 mt-auto">
                <button
                    className="w-full py-3.5 rounded-2xl text-[14px] font-medium text-muted-foreground/80 border border-border/50 bg-secondary/20 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive transition-all active:scale-[0.98]"
                    onClick={() => setViewState("cancel")}
                >
                    {t("subscription.cancel_subscription")}
                </button>
            </div>
        </div>
      );
  };

  const renderCancelConfirm = () => (
      <div className="flex flex-col h-full overflow-y-auto animate-in slide-in-from-right-3 duration-300">
          <div className="flex items-center px-5 pt-12 pb-5">
              <button onClick={() => setViewState("active")} className="text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-xl hover:bg-secondary/60 transition-colors">
                  <IconX className="w-5 h-5" />
              </button>
              <h2 className="text-[17px] font-semibold text-foreground mx-auto pr-7">{t("subscription.cancel_plan")}</h2>
          </div>

          <div className="flex-1 flex flex-col px-5 pt-2 pb-10">
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
                  {subInfo?.currentPeriodEnd
                      ? t("subscription.cancel_info", { date: new Date(subInfo.currentPeriodEnd * 1000).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' }) })
                      : t("subscription.cancel_info_fallback", { days: daysLeft })
                  }
              </p>

              {/* Summary of what will be lost */}
              <div className="bg-secondary/30 rounded-2xl border border-border/30 overflow-hidden mb-8">
                  {[
                      t("subscription.lost_benefits.analysis"),
                      t("subscription.lost_benefits.routines"),
                      t("subscription.lost_benefits.plan"),
                      t("subscription.lost_benefits.ads"),
                  ].map((item, i, arr) => (
                      <div key={item}>
                          <div className="flex items-center gap-3 px-4 py-3">
                              <span className="text-muted-foreground/40 text-[16px]">—</span>
                              <span className="text-[14px] text-muted-foreground">{item}</span>
                          </div>
                          {i < arr.length - 1 && <div className="h-px bg-border/30 mx-4" />}
                      </div>
                  ))}
              </div>

              <div className="mt-auto space-y-2.5">
                  <button
                      className="w-full py-4 rounded-2xl bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98]"
                      onClick={() => setViewState("active")}
                  >
                      {t("subscription.keep_subscription")}
                  </button>
                  <button
                      className="w-full py-4 rounded-2xl text-destructive/80 hover:text-destructive hover:bg-destructive/8 text-[14px] font-medium transition-colors"
                      onClick={() => {
                          onCancel(() => {
                              setViewState("active");
                              onOpenChange(false);
                          });
                      }}
                      disabled={loading}
                  >
                      {loading ? t("settings.delete_account_sheet.sending") : t("subscription.confirm_cancel")}
                  </button>
              </div>
          </div>
      </div>
  );

  let content = null;
  if(viewState === "benefits") content = renderBenefits();
  if(viewState === "active") content = renderActive();
  if(viewState === "cancel") content = renderCancelConfirm();

  // Only show decorative bg on benefits/paywall screen
  const showDecorativeBg = viewState === "benefits";

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground font-sans flex flex-col w-full h-full overflow-hidden">
        {/* Decorative gradients only on paywall */}
        {showDecorativeBg && (
            <>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/15 dark:bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/15 dark:bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
            </>
        )}

        <div className="relative z-10 h-full w-full">
            {content}
            {renderStripeOverlay()}
        </div>

        {/* Fixed bottom bar ONLY for benefits */}
        {viewState === "benefits" && (
            <div className={`absolute bottom-0 left-0 right-0 px-6 pb-8 pt-32 bg-gradient-to-t from-background via-background/95 to-transparent z-20 transition-transform duration-500 ${showStripeModal ? 'translate-y-[120%]' : 'translate-y-0'}`}>
                <p className="text-center text-muted-foreground text-[14px] mb-4 font-medium">
                    {t("subscription.cancel_anytime")}
                </p>
                <button 
                    className="w-full bg-foreground text-background font-bold text-[18px] py-[18px] rounded-[20px] active:scale-[0.98] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:shadow-lg"
                    onClick={() => setShowStripeModal(true)}
                >
                    {t("subscription.continue")}
                </button>
            </div>
        )}
    </div>
  );
}