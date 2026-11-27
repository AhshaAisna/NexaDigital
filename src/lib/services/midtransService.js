import {
  createMidtransTransactionApi,
  fetchMidtransConfigApi,
  syncOrderPaymentStatusApi
} from './apiService';
import { upsertOrderInStore } from '../../stores/marketplaceStore';

let snapScriptPromise = null;

/**
 * Resolve Midtrans client configuration from Vite env or backend /api/midtrans/config.
 */
async function resolveMidtransClientConfig() {
  const envClientKey = (import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '').trim();
  const envIsProd = String(import.meta.env.VITE_MIDTRANS_IS_PRODUCTION || 'false').toLowerCase() === 'true';

  if (envClientKey) {
    return {
      configured: true,
      clientKey: envClientKey,
      snapScriptUrl: envIsProd
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    };
  }

  const backendConfig = await fetchMidtransConfigApi();
  return {
    configured: Boolean(backendConfig?.configured && backendConfig?.client_key),
    clientKey: backendConfig?.client_key || '',
    snapScriptUrl: backendConfig?.snap_script_url || 'https://app.sandbox.midtrans.com/snap/snap.js'
  };
}

/**
 * Dynamically load Midtrans Snap.js once using configured client_key.
 */
export async function ensureSnapScriptLoaded() {
  if (typeof window === 'undefined') {
    throw new Error('Midtrans Snap hanya dapat dijalankan di browser.');
  }
  if (window.snap && typeof window.snap.pay === 'function') {
    return window.snap;
  }
  if (snapScriptPromise) {
    return snapScriptPromise;
  }

  snapScriptPromise = (async () => {
    const cfg = await resolveMidtransClientConfig();
    if (!cfg.configured || !cfg.clientKey) {
      snapScriptPromise = null;
      throw new Error('MIDTRANS_NOT_CONFIGURED');
    }

    const existing = document.getElementById('midtrans-snap-script');
    if (existing) {
      if (window.snap && typeof window.snap.pay === 'function') {
        return window.snap;
      }
      existing.remove();
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src = cfg.snapScriptUrl;
      script.setAttribute('data-client-key', cfg.clientKey);
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuat script Midtrans Snap.js.'));
      document.head.appendChild(script);
    });

    if (!window.snap || typeof window.snap.pay !== 'function') {
      snapScriptPromise = null;
      throw new Error('Midtrans Snap gagal diinisialisasi di browser.');
    }

    return window.snap;
  })();

  return snapScriptPromise;
}

/**
 * Open Midtrans Snap payment modal for the given snapToken.
 */
export async function openMidtransSnap(snapToken, callbacks = {}) {
  if (!snapToken) {
    throw new Error('Snap token tidak tersedia.');
  }

  const snap = await ensureSnapScriptLoaded();
  snap.pay(snapToken, {
    onSuccess: (result) => callbacks.onSuccess?.(result),
    onPending: (result) => callbacks.onPending?.(result),
    onError: (result) => callbacks.onError?.(result),
    onClose: () => callbacks.onClose?.()
  });
}

/**
 * Sync order payment status from Midtrans and refresh global stores.
 */
export async function syncOrderPaymentAndStore(orderId) {
  const syncedOrder = await syncOrderPaymentStatusApi(orderId);
  if (syncedOrder) {
    upsertOrderInStore(syncedOrder);
  }
  return syncedOrder;
}

/**
 * Start or resume Midtrans Snap payment for an order and keep stores synchronized.
 */
export async function startMidtransPaymentForOrder(order, callbacks = {}) {
  if (!order?.id) {
    throw new Error('Data pesanan tidak valid.');
  }

  let activeOrder = order;
  let snapToken =
    order.snapToken ||
    order.snap_token ||
    order._paymentMeta?.snapToken ||
    null;

  if (!snapToken) {
    const tx = await createMidtransTransactionApi(order.id);
    snapToken = tx.snapToken;
    if (tx.order) {
      activeOrder = tx.order;
      upsertOrderInStore(activeOrder);
    }
  }

  if (!snapToken) {
    throw new Error('Snap token Midtrans tidak tersedia untuk pesanan ini.');
  }

  await openMidtransSnap(snapToken, {
    onSuccess: async (result) => {
      let latest = activeOrder;
      try {
        const synced = await syncOrderPaymentAndStore(activeOrder.id);
        if (synced) latest = synced;
      } catch {
        // Webhook server-to-server may update asynchronously
      }
      await callbacks.onSuccess?.(latest, result);
    },
    onPending: async (result) => {
      let latest = activeOrder;
      try {
        const synced = await syncOrderPaymentAndStore(activeOrder.id);
        if (synced) latest = synced;
      } catch {}
      await callbacks.onPending?.(latest, result);
    },
    onError: (result) => callbacks.onError?.(activeOrder, result),
    onClose: () => callbacks.onClose?.(activeOrder)
  });

  return activeOrder;
}
