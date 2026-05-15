import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

export default function StripeCheckoutForm({ onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required", // Evita la redirección automática a otra web si no es necesaria
        });

        if (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // ¡Pago exitoso!
            onSuccess();
        } else {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 mt-2">
            {/* Botones de pago rápido (Google Pay, Apple Pay) */}
            <div className="mb-6">
               <ExpressCheckoutElement onConfirm={() => setIsLoading(true)} />
            </div>

            <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-border/50"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold tracking-wider text-muted-foreground uppercase opacity-80">
                    O paga con tarjeta
                </span>
                <div className="flex-grow border-t border-border/50"></div>
            </div>
            <PaymentElement 
               options={{
                   layout: "tabs", // Opciones de Stripe: 'tabs', 'accordion', 'auto'
               }} 
            />

            {errorMessage && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-[16px] text-destructive text-[15px] font-medium backdrop-blur-md">
                    {errorMessage}
                </div>
            )}

            <div className="flex gap-4 pt-4 pb-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-6 rounded-[16px] font-bold text-base border-border/50 hover:bg-secondary/80 transition-all active:scale-95" 
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    className="flex-1 py-6 rounded-[16px] bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-base shadow-lg shadow-blue-500/30 transition-all active:scale-95" 
                    disabled={!stripe || isLoading}
                >
                    {isLoading ? "Procesando Seguro..." : "Pagar 9.99€"}
                </Button>
            </div>
        </form>
    );
}
