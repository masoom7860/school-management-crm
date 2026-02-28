import React from 'react';
import { Typography, Divider, Table, Card } from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;
const { Column } = Table;

const ReceiptViewerModal = ({ data }) => {
  if (!data) {
    return <div className="text-center text-gray-500 p-6">No receipt data available.</div>;
  }

  const {
    schoolName,
    schoolAddress,
    schoolLogo,
    receiptNumber,
    student,
    paymentDetails,
    allPayments,
    feeDetails,
    feeStructureName
  } = data;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} className="m-0">{schoolName || 'School Name'}</Title>
          {schoolAddress && <Text type="secondary">{schoolAddress}</Text>}
        </div>
        {schoolLogo && (
          <img src={schoolLogo} alt="School Logo" className="h-16 object-contain" />
        )}
      </div>

      <Divider className="border-gray-300" />

      {/* Receipt Details */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <Text strong>Receipt Number:</Text> <span>{receiptNumber}</span><br />
          <Text strong>Date:</Text> <span>{moment(paymentDetails.date).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        <div>
          <Text strong>Status:</Text> <span className="uppercase">{feeDetails.status}</span><br />
          <Text strong>Academic Year:</Text> <span>{feeDetails.academicYear}</span>
        </div>
      </div>

      {/* Student Info */}
      <Card size="small" bordered={false} className="mb-6 bg-gray-50">
        <Title level={5}>Student Information</Title>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><Text strong>Name:</Text> {student.name}</div>
          <div><Text strong>Roll Number:</Text> {student.rollNumber}</div>
          <div><Text strong>Class:</Text> {student.className || 'N/A'}</div> {/* Added fallback 'N/A' */}
        </div>
      </Card>

      {/* Fee Summary */}
      <Card size="small" bordered={false} className="mb-6 bg-gray-50">
        <Title level={5}>Fee Summary</Title>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><Text strong>Month:</Text> {feeStructureName}</div>
          <div><Text strong>Total Fee:</Text> ₹{feeDetails.totalAmount}</div>
          <div><Text strong>Paid (Cumulative):</Text> ₹{feeDetails.paidAmount}</div>
          <div><Text strong>Due:</Text> ₹{feeDetails.dueAmount}</div>
        </div>
      </Card>

      {/* Fee Components Breakdown */}
      {data.feeComponents && data.feeComponents.length > 0 && (
        <Card size="small" bordered={false} className="mb-6 bg-gray-50">
          <Title level={5}>Fee Breakdown</Title>
          <Table
            dataSource={data.feeComponents}
            pagination={false}
            rowKey="name"
            size="small"
            bordered
            className="w-full"
          >
            <Column title="Component" dataIndex="name" key="name" />
            <Column title="Amount" dataIndex="amount" key="amount" render={amount => `₹${amount}`} />
          </Table>
        </Card>
      )}

      {/* Current Payment */}
      <Card size="small" bordered={false} className="mb-6 bg-gray-50">
        <Title level={5}>Payment Information</Title>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><Text strong>Amount Paid:</Text> ₹{paymentDetails.amount}</div>
          <div><Text strong>Mode:</Text> {paymentDetails.mode}</div>
          {paymentDetails.remark && <div className="col-span-2"><Text strong>Remark:</Text> {paymentDetails.remark}</div>}
        </div>
      </Card>

      {/* Payment History */}
      <div className="mb-4">
        <Title level={5}>Payment History</Title>
        {allPayments && allPayments.length > 0 ? (
          <Table
            dataSource={allPayments}
            pagination={false}
            rowKey="receiptNumber"
            size="small"
            bordered
          >
            <Column title="Receipt No." dataIndex="receiptNumber" />
            <Column title="Amount" dataIndex="amount" render={amount => `₹${amount}`} />
            <Column title="Date" dataIndex="date" render={date => moment(date).format('DD/MM/YYYY')} />
            <Column title="Mode" dataIndex="mode" />
            <Column title="Remark" dataIndex="remark" />
          </Table>
        ) : (
          <Text type="secondary">No payment history available.</Text>
        )}
      </div>

      {/* Footer */}
      <Divider className="border-gray-300" />
      <div className="text-center text-xs text-gray-500">
        This is a system-generated receipt. No signature required.
      </div>
    </div>
  );
};

export default ReceiptViewerModal;
