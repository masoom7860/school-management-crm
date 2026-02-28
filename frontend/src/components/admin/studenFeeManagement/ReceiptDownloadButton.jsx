import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateReceiptPdf } from '../../../api/studentFeeApi';
import { downloadBlob } from '../../../utils/download';

const ReceiptDownloadButton = ({ studentFeeId, receiptNumber, className = '', onDownloaded }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!studentFeeId || !receiptNumber) return;
    setDownloading(true);
    try {
      const blob = await generateReceiptPdf(studentFeeId, receiptNumber);
      const ok = downloadBlob(blob, `receipt-${receiptNumber}.pdf`, 'application/pdf');
      if (!ok) throw new Error('Failed to trigger download');
      toast.success('Receipt downloaded successfully!');
      onDownloaded && onDownloaded();
    } catch (error) {
      toast.error(error?.message || 'Failed to download receipt');
      console.error('Download receipt error:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      title={downloading ? 'Downloading...' : 'Download Latest Receipt'}
      className={`text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Download size={18} className={downloading ? 'animate-pulse' : ''} />
    </button>
  );
};

export default ReceiptDownloadButton;
