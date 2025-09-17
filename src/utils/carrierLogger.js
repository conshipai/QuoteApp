// src/utils/carrierLogger.js
const SENSITIVE_HEADER_KEYS = ['authorization', 'api-key', 'x-api-key', 'token', 'cookie', 'set-cookie'];

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  // Common secret fields to mask
  ['password','secret','accessToken','refreshToken','apiKey','ApiKey','APIKey','token','Token'].forEach(k => {
    if (k in clone) clone[k] = '***';
  });
  if (clone.headers && typeof clone.headers === 'object') {
    for (const k of Object.keys(clone.headers)) {
      if (SENSITIVE_HEADER_KEYS.includes(k.toLowerCase())) clone.headers[k] = '***';
    }
  }
  return clone;
}

function summarizeRate(rate) {
  if (!rate || typeof rate !== 'object') return rate;
  const { carrier, carrierName, total, base, fuel, accessorials, transitDays, service, serviceLevel, quoteNumber } = rate;
  const acc = Array.isArray(accessorials) ? accessorials : [];
  return {
    carrier: carrier || carrierName,
    service: service || serviceLevel,
    quoteNumber,
    base, fuel, total,
    accessorials: acc.map(a => (a?.code || a?.name || a)),
    transitDays
  };
}

/**
 * Wrap a provider's getRates to log request/response uniformly.
 * If a provider exposes getDebug() or has ._debug, we'll include that too (redacted).
 */
function wrapProviderWithLogging(provider, context = {}) {
  if (!provider || typeof provider.getRates !== 'function') return provider;

  const original = provider.getRates.bind(provider);

  provider.getRates = async function wrappedGetRates(requestData) {
    const meta = {
      providerCode: provider.code || provider.constructor?.name,
      providerName: provider.name || provider.code,
      accountType: provider.isCustomerAccount ? 'customer' : 'company',
      accountId: provider.accountId,
      accountNumber: provider.accountNumber,
      requestId: context.requestId,
      userId: context.userId,
      companyId: context.companyId
    };

    // Only log the fields we care about from requestData
    const reqSummary = {
      originZip: requestData?.originZip,
      originCity: requestData?.originCity,
      originState: requestData?.originState,
      destZip: requestData?.destZip,
      destCity: requestData?.destCity,
      destState: requestData?.destState,
      pickupDate: requestData?.pickupDate,
      pieces: requestData?.commodities?.length,
      // rough dims/weight summary
      totalWeight: (requestData?.commodities || []).reduce((s,c)=>s + (+c.weight || 0), 0),
      dimsPreview: (requestData?.commodities || []).map(c => `${c.length}x${c.width}x${c.height}@${c.weight}`).slice(0,3),
      accessorials: {
        liftgatePickup: !!requestData?.liftgatePickup,
        liftgateDelivery: !!requestData?.liftgateDelivery,
        residentialDelivery: !!requestData?.residentialDelivery,
        insideDelivery: !!requestData?.insideDelivery,
        limitedAccessPickup: !!requestData?.limitedAccessPickup,
        limitedAccessDelivery: !!requestData?.limitedAccessDelivery,
      }
    };

    if (process.env.LOG_CARRIER_REQUESTS === 'true') {
      console.log(`📤 [CARRIER REQ] ${meta.providerCode}`, { meta, request: reqSummary });
      // If provider exposes debug payload, include it (redacted)
      try {
        const dbg = typeof provider.getDebug === 'function' ? provider.getDebug() : provider._debug;
        if (dbg) console.log(`   ↳ debug:`, redact(dbg));
      } catch {}
    }

    try {
      const rate = await original(requestData);

      if (process.env.LOG_CARRIER_REQUESTS === 'true') {
        // If provider populated debug after call, log it
        try {
          const dbg = typeof provider.getDebug === 'function' ? provider.getDebug() : provider._debug;
          if (dbg) console.log(`📥 [CARRIER RESP DBG] ${meta.providerCode}`, redact(dbg));
        } catch {}
        console.log(`✅ [CARRIER OK] ${meta.providerCode}`, summarizeRate(rate));
      }

      return rate;
    } catch (err) {
      const safeErr = {
        message: err?.message,
        status: err?.response?.status,
        data: redact(err?.response?.data),
      };
      console.error(`❌ [CARRIER FAIL] ${meta.providerCode}`, { meta, error: safeErr });
      throw err;
    }
  };

  return provider;
}

module.exports = { wrapProviderWithLogging, redact, summarizeRate };
