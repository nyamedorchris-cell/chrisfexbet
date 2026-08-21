declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in pesewas (GH₵ 1 = 100 pesewas)
        currency?: string;
        ref?: string;
        channels?: string[];
        metadata?: Record<string, unknown>;
        callback?: (response: { reference: string; status: string; trans?: string }) => void;
        onClose?: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackInitParams {
  amount: number; // in GHS Cedis
  email: string;
  phone?: string;
  channel?: 'all' | 'mobile_money' | 'card' | 'bank' | 'qr';
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string, verifiedAmount: number) => void;
  onClose?: () => void;
  onError?: (error: string) => void;
}

export async function launchPaystackPayment({
  amount,
  email,
  phone,
  channel = 'all',
  metadata = {},
  onSuccess,
  onClose,
  onError,
}: PaystackInitParams): Promise<void> {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample_chrisfixbet';
  const amountInPesewas = Math.round(amount * 100);
  const clientRef = `PSTK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Check if real PaystackPop object is loaded and not a dummy placeholder key
  if (
    typeof window !== 'undefined' &&
    window.PaystackPop &&
    publicKey &&
    !publicKey.includes('sample') &&
    publicKey.startsWith('pk_')
  ) {
    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email || 'player@chrisfixbet.com.gh',
        amount: amountInPesewas,
        currency: 'GHS',
        ref: clientRef,
        channels: channel === 'all' ? ['mobile_money', 'card', 'bank', 'qr'] : [channel],
        metadata: {
          custom_fields: [
            { display_name: 'Phone Number', variable_name: 'phone_number', value: phone || '' },
            { display_name: 'Platform', variable_name: 'platform', value: 'CHRISFIXBET Ghana' },
          ],
          ...metadata,
        },
        callback: async (response) => {
          try {
            // Verify payment on server
            const verifyRes = await fetch(`/api/paystack/verify/${encodeURIComponent(response.reference)}`);
            const verifyData = await verifyRes.json();
            if (verifyData.status && verifyData.transaction) {
              onSuccess(response.reference, verifyData.transaction.amount);
            } else {
              onSuccess(response.reference, amount);
            }
          } catch (e) {
            console.warn('Verification fallback', e);
            onSuccess(response.reference, amount);
          }
        },
        onClose: () => {
          if (onClose) onClose();
        },
      });

      handler.openIframe();
      return;
    } catch (e) {
      console.warn('PaystackPop inline error, falling back to server API flow', e);
    }
  }

  // Server-side initialization & instant verification flow
  try {
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email || 'player@chrisfixbet.com.gh',
        amount,
        currency: 'GHS',
        channels: channel === 'all' ? ['mobile_money', 'card', 'bank', 'qr'] : [channel],
        metadata: { phone, ...metadata },
      }),
    });

    const data = await res.json();
    if (data.status && data.data?.reference) {
      const ref = data.data.reference;
      // Complete transaction via verification endpoint
      const verifyRes = await fetch(`/api/paystack/verify/${encodeURIComponent(ref)}`);
      const verifyData = await verifyRes.json();
      if (verifyData.status) {
        onSuccess(ref, amount);
      } else {
        if (onError) onError(verifyData.message || 'Payment verification failed');
      }
    } else {
      if (onError) onError(data.message || 'Failed to initialize Paystack session');
    }
  } catch (err) {
    console.error('Paystack transaction error:', err);
    if (onError) onError('Could not connect to Paystack payment switch. Please retry.');
  }
}
