// client/src/components/settings/PaymentInformation.jsx
import { CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

export default function PaymentInformation() {

  const handleAddPayment = () => {
    // Di aplikasi nyata, ini akan membuka modal dari Stripe/Midtrans
    alert('This would open a secure payment gateway modal.');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
      <p className="text-sm text-gray-500 mt-1 mb-8">Manage your saved payment methods.</p>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Security Note:</span> For your safety, never store credit card details directly. This is a placeholder UI. A real application should integrate a secure payment provider like Stripe or Midtrans.
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800">Your Payment Methods</h3>
        <div className="mt-4 p-6 border rounded-lg flex flex-col items-center justify-center text-center">
          <CreditCardIcon className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-900">No payment methods saved</p>
          <p className="mt-1 text-sm text-gray-500">Add a payment method for faster checkout in the future.</p>
          <div className="mt-6">
            <Button onClick={handleAddPayment}>
              Add Payment Method
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}