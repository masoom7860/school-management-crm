import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function PaymentSystem() {
  const [currency, setCurrency] = useState('USD');
  const [currencyPosition, setCurrencyPosition] = useState('Left with a space');
  const [offlineInstruction, setOfflineInstruction] = useState('');
  const [file, setFile] = useState(null);

  const [paypal, setPaypal] = useState({
    active: 'No',
    mode: 'Sandbox',
    sandboxClientId: '',
    sandboxSecret: '',
    liveClientId: '',
    liveSecret: '',
  });

  const [stripe, setStripe] = useState({
    active: 'No',
    mode: 'Test',
    testPublicKey: '',
    testSecretKey: '',
    livePublicKey: '',
    liveSecretKey: '',
  });

  const [paytm, setPaytm] = useState({
    active: 'No',
    mode: 'Test',
    testMerchantId: '',
    testMerchantKey: '',
    liveMerchantId: '',
    liveMerchantKey: '',
    environment: '',
    merchantWebsite: '',
    channel: '',
    industryType: '',
  });

  const [razorpay, setRazorpay] = useState({
    active: 'No',
    mode: 'Test',
    testPublicKey: '',
    testSecretKey: '',
    livePublicKey: '',
    liveSecretKey: '',
    themeColor: '',
  });

  const [flutterwave, setFlutterwave] = useState({
    active: 'No',
    mode: 'Test',
    testPublicKey: '',
    testSecretKey: '',
    testEncryptionKey: '',
    livePublicKey: '',
    liveSecretKey: '',
    liveEncryptionKey: '',
  });

  const handleCurrencyUpdate = (e) => {
    e.preventDefault();
    toast.success(`Currency updated: ${currency} - ${currencyPosition}`);
  };

  const handleOfflineSubmit = (e) => {
    e.preventDefault();
    toast.success(`Offline Payment Instruction Submitted`);
  };

  const handlePaypalUpdate = (e) => {
    e.preventDefault();
    toast.success(`PayPal settings updated`);
  };

  const handleStripeUpdate = (e) => {
    e.preventDefault();
    toast.success(`Stripe settings updated`);
  };

  const handlePaytmUpdate = (e) => {
    e.preventDefault();
    toast.success('Paytm settings updated');
  };

  const handleRazorpayUpdate = (e) => {
    e.preventDefault();
    toast.success('Razorpay settings updated');
  };

  const handleFlutterwaveUpdate = (e) => {
    e.preventDefault();
    toast.success('Flutterwave settings updated');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">Payment settings</h1>
        <p className="text-sm text-gray-500 mb-6">Home &gt; Settings &gt; Payment settings</p>
      </div>

      {/* Currency Section */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Global Currency</h2>
        <form onSubmit={handleCurrencyUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Global Currency</label>
            <select className="w-full border px-3 py-2 rounded" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Currency Position</label>
            <select className="w-full border px-3 py-2 rounded" value={currencyPosition} onChange={e => setCurrencyPosition(e.target.value)}>
              <option>Left with a space</option>
              <option>Right with a space</option>
              <option>Left without space</option>
              <option>Right without space</option>
            </select>
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Update Currency</button>
        </form>
      </section>

      {/* Offline Payment */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Offline Payment Instruction</h2>
        <form onSubmit={handleOfflineSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Instruction</label>
            <textarea className="w-full border px-3 py-2 rounded" rows={3} value={offlineInstruction} onChange={e => setOfflineInstruction(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image/PDF</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full border px-3 py-2 rounded" />
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Submit</button>
        </form>
      </section>

      {/* PayPal */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">PayPal Settings</h2>
        <form onSubmit={handlePaypalUpdate}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Active</label>
              <select className="w-full border px-3 py-2 rounded" value={paypal.active} onChange={e => setPaypal({ ...paypal, active: e.target.value })}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select className="w-full border px-3 py-2 rounded" value={paypal.mode} onChange={e => setPaypal({ ...paypal, mode: e.target.value })}>
                <option>Sandbox</option>
                <option>Live</option>
              </select>
            </div>
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Client ID (Sandbox)" value={paypal.sandboxClientId} onChange={e => setPaypal({ ...paypal, sandboxClientId: e.target.value })} />
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Client Secret (Sandbox)" value={paypal.sandboxSecret} onChange={e => setPaypal({ ...paypal, sandboxSecret: e.target.value })} />
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Client ID (Live)" value={paypal.liveClientId} onChange={e => setPaypal({ ...paypal, liveClientId: e.target.value })} />
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Client Secret (Live)" value={paypal.liveSecret} onChange={e => setPaypal({ ...paypal, liveSecret: e.target.value })} />
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Update PayPal</button>
        </form>
      </section>

      {/* Stripe */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Stripe Settings</h2>
        <form onSubmit={handleStripeUpdate}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Active</label>
              <select className="w-full border px-3 py-2 rounded" value={stripe.active} onChange={e => setStripe({ ...stripe, active: e.target.value })}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select className="w-full border px-3 py-2 rounded" value={stripe.mode} onChange={e => setStripe({ ...stripe, mode: e.target.value })}>
                <option>Test</option>
                <option>Live</option>
              </select>
            </div>
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Test Public Key" value={stripe.testPublicKey} onChange={e => setStripe({ ...stripe, testPublicKey: e.target.value })} />
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Test Secret Key" value={stripe.testSecretKey} onChange={e => setStripe({ ...stripe, testSecretKey: e.target.value })} />
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Live Public Key" value={stripe.livePublicKey} onChange={e => setStripe({ ...stripe, livePublicKey: e.target.value })} />
            <input className="border px-3 py-2 rounded col-span-2" placeholder="Live Secret Key" value={stripe.liveSecretKey} onChange={e => setStripe({ ...stripe, liveSecretKey: e.target.value })} />
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Update Stripe</button>
        </form>
      </section>

      {/* Paytm */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Paytm Settings</h2>
        <form onSubmit={handlePaytmUpdate} className="grid gap-4 mb-10">
          <select value={paytm.active} onChange={e => setPaytm({ ...paytm, active: e.target.value })} className="border px-3 py-2 rounded">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          <select value={paytm.mode} onChange={e => setPaytm({ ...paytm, mode: e.target.value })} className="border px-3 py-2 rounded">
            <option value="Test">Test</option>
            <option value="Live">Live</option>
          </select>
          <input className="border px-3 py-2 rounded" placeholder="Test Merchant ID" value={paytm.testMerchantId} onChange={e => setPaytm({ ...paytm, testMerchantId: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Test Merchant Key" value={paytm.testMerchantKey} onChange={e => setPaytm({ ...paytm, testMerchantKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Merchant ID" value={paytm.liveMerchantId} onChange={e => setPaytm({ ...paytm, liveMerchantId: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Merchant Key" value={paytm.liveMerchantKey} onChange={e => setPaytm({ ...paytm, liveMerchantKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Environment" value={paytm.environment} onChange={e => setPaytm({ ...paytm, environment: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Merchant Website" value={paytm.merchantWebsite} onChange={e => setPaytm({ ...paytm, merchantWebsite: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Channel" value={paytm.channel} onChange={e => setPaytm({ ...paytm, channel: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Industry Type" value={paytm.industryType} onChange={e => setPaytm({ ...paytm, industryType: e.target.value })} />
          <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">Update Paytm</button>
        </form>
      </section>

      {/* Razorpay */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Razorpay Settings</h2>
        <form onSubmit={handleRazorpayUpdate} className="grid gap-4 mb-10">
          <select value={razorpay.active} onChange={e => setRazorpay({ ...razorpay, active: e.target.value })} className="border px-3 py-2 rounded">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          <select value={razorpay.mode} onChange={e => setRazorpay({ ...razorpay, mode: e.target.value })} className="border px-3 py-2 rounded">
            <option value="Test">Test</option>
            <option value="Live">Live</option>
          </select>
          <input className="border px-3 py-2 rounded" placeholder="Test Public Key" value={razorpay.testPublicKey} onChange={e => setRazorpay({ ...razorpay, testPublicKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Test Secret Key" value={razorpay.testSecretKey} onChange={e => setRazorpay({ ...razorpay, testSecretKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Public Key" value={razorpay.livePublicKey} onChange={e => setRazorpay({ ...razorpay, livePublicKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Secret Key" value={razorpay.liveSecretKey} onChange={e => setRazorpay({ ...razorpay, liveSecretKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Theme Color" value={razorpay.themeColor} onChange={e => setRazorpay({ ...razorpay, themeColor: e.target.value })} />
          <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">Update Razorpay</button>
        </form>
      </section>

      {/* Flutterwave */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Flutterwave Settings</h2>
        <form onSubmit={handleFlutterwaveUpdate} className="grid gap-4">
          <select value={flutterwave.active} onChange={e => setFlutterwave({ ...flutterwave, active: e.target.value })} className="border px-3 py-2 rounded">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          <select value={flutterwave.mode} onChange={e => setFlutterwave({ ...flutterwave, mode: e.target.value })} className="border px-3 py-2 rounded">
            <option value="Test">Test</option>
            <option value="Live">Live</option>
          </select>
          <input className="border px-3 py-2 rounded" placeholder="Test Public Key" value={flutterwave.testPublicKey} onChange={e => setFlutterwave({ ...flutterwave, testPublicKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Test Secret Key" value={flutterwave.testSecretKey} onChange={e => setFlutterwave({ ...flutterwave, testSecretKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Test Encryption Key" value={flutterwave.testEncryptionKey} onChange={e => setFlutterwave({ ...flutterwave, testEncryptionKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Public Key" value={flutterwave.livePublicKey} onChange={e => setFlutterwave({ ...flutterwave, livePublicKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Secret Key" value={flutterwave.liveSecretKey} onChange={e => setFlutterwave({ ...flutterwave, liveSecretKey: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Live Encryption Key" value={flutterwave.liveEncryptionKey} onChange={e => setFlutterwave({ ...flutterwave, liveEncryptionKey: e.target.value })} />
          <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">Update Flutterwave</button>
        </form>
      </section>
      {/* Footer */}
      <footer className="text-sm text-center text-gray-500 mt-6">
        2025 © <a href="#" className="text-red-500 font-medium">By Zosto Technology </a>
      </footer>
    </div>
  );
}
