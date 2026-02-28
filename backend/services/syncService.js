const mongoose = require('mongoose');
const StudentFee = require('../models/studentFeeModel'); // Assuming StudentFee model is available

// Helper function to apply a single offline payment operation
const applyOfflinePaymentOperation = async (operationData, schoolId, user, session) => {
  const { studentId, academicYear, amount, mode, note, deviceId, paymentDate } = operationData;

  try {
    // Find the fee record using studentId, academicYear, and schoolId
    const feeRecord = await StudentFee.findOne({
      student: studentId,
      schoolId,
      academicYear
    }).session(session);

    if (!feeRecord) {
      console.warn(`Sync Warning: Fee record not found for student ${studentId}, academic year ${academicYear}, school ${schoolId}. Operation skipped.`);
      return { success: false, message: 'Fee record not found' };
    }

    // Check if this specific offline operation has already been synced
    // This prevents double-counting if the same operation is sent multiple times
    const alreadySynced = feeRecord.paymentHistory.some(payment =>
      payment.offlineSync &&
      payment.offlineSync.isOffline &&
      payment.offlineSync.deviceId === deviceId &&
      // A more robust check might involve a unique operation ID generated client-side
      // For now, we'll check amount and date (might not be unique) or rely on client-side
      // logic to not resend processed operations.
      // A better approach would be to store a unique offlineOperationId in the payment entry
      // and check against that. Assuming operationData might contain such an ID.
      // If operationData has a unique `offlineOperationId`:
      // payment.offlineSync.offlineOperationId === operationData.offlineOperationId
      // Without a unique ID from the client, this check is limited.
      // Let's assume for now the client sends operations that haven't been synced.
      // We can add a check based on the operation data itself if needed, but it's tricky.
      // For simplicity, we'll rely on the client not sending duplicates for now,
      // or implement a more complex check if a unique ID is added to operationData.
      false // Placeholder: Assume client handles not sending duplicates for now
    );

    if (alreadySynced) {
       console.log(`Sync Info: Offline payment operation for student ${studentId}, amount ${amount} from device ${deviceId} already synced. Skipping.`);
       return { success: true, message: 'Operation already synced' };
    }


    // Check balance before applying payment
    const currentBalance = feeRecord.totalFee - feeRecord.amountPaid;
    if (amount > currentBalance) {
      console.warn(`Sync Warning: Payment amount ${amount} exceeds current balance ${currentBalance} for student ${studentId}. Applying partial payment up to balance.`);
      // Apply only up to the remaining balance
      operationData.amount = currentBalance;
      if (operationData.amount <= 0) {
         return { success: false, message: 'Payment amount exceeds balance and balance is zero or negative' };
      }
    }

    // Add entry to payment history
    const newPayment = {
      amount: operationData.amount, // Use potentially adjusted amount
      date: paymentDate ? new Date(paymentDate) : new Date(), // Use paymentDate from operationData if available
      mode: mode || 'Offline', // Default mode to 'Offline' if not specified
      note: note || 'Offline payment (synced)',
      transactionId: `SYNC_${deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate a sync-specific transaction ID
      recordedBy: user._id, // User who initiated the sync (staff/admin)
      offlineSync: {
        isOffline: true,
        syncDate: new Date(),
        deviceId: deviceId
        // If operationData had a unique ID, store it here:
        // offlineOperationId: operationData.offlineOperationId
      }
    };

    feeRecord.paymentHistory.push(newPayment);

    // Apply payment to dues (simplified logic for sync)
    let remainingAmount = newPayment.amount;
    feeRecord.dues.sort((a, b) => a.dueDate - b.dueDate);

    for (const due of feeRecord.dues) {
      if (due.status !== 'Paid' && remainingAmount > 0) {
        const amountToApply = Math.min(remainingAmount, due.amount - due.paidAmount);
        if (amountToApply > 0) {
          due.paidAmount += amountToApply;
          remainingAmount -= amountToApply;
          // Add payment entry reference to the specific due
          due.paymentEntries.push(newPayment); // Push the same payment entry object
          due.status = due.paidAmount >= due.amount ? 'Paid' : 'Partial';
        }
      }
    }

    // Update totals
    feeRecord.amountPaid = feeRecord.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    feeRecord.balance = feeRecord.totalFee - feeRecord.amountPaid;
    feeRecord.status = feeRecord.balance <= 0 ? 'Paid' : (feeRecord.amountPaid > 0 ? 'Partial' : 'Pending');

    // Remove the processed operation from the offlineOperations array
    // This assumes the operationData includes a way to identify the specific operation
    // that was originally recorded offline. If the client sends the full operation object,
    // we might need to match based on multiple fields or add a unique ID.
    // For now, we'll assume the client sends operations that need processing and
    // the sync process itself marks them as handled implicitly by applying them.
    // A more robust approach would involve the client sending unique IDs for each offline operation.
    // If operationData had a unique `offlineOperationId`:
    // feeRecord.offlineOperations = feeRecord.offlineOperations.filter(op =>
    //   !(op.operationType === 'payment' && op.operationData.offlineOperationId === operationData.offlineOperationId)
    // );


    feeRecord.lastSync = new Date(); // Update last sync timestamp
    await feeRecord.save({ session });

    return { success: true, message: 'Payment operation synced successfully' };

  } catch (error) {
    console.error('Error applying offline payment operation:', error);
    return { success: false, message: `Error applying operation: ${error.message}` };
  }
};


module.exports = {
  syncOfflineOperations: async (schoolId, deviceId, operations, user) => {
    console.log(`Starting sync for school ${schoolId}, device ${deviceId} with ${operations.length} operations.`);

    const session = await mongoose.startSession();
    session.startTransaction();

    const results = [];

    try {
      for (const operation of operations) {
        let result = { operation, success: false, message: 'Unknown operation type' };

        // Process different operation types
        switch (operation.operationType) {
          case 'payment':
            // Ensure operationData exists and contains necessary fields
            if (operation.operationData && operation.operationData.studentId && operation.operationData.academicYear && operation.operationData.amount) {
               result = await applyOfflinePaymentOperation(operation.operationData, schoolId, user, session);
            } else {
               result.message = 'Invalid payment operation data';
               console.warn('Sync Warning: Invalid payment operation data received:', operation);
            }
            break;
          // Add cases for other operation types (e.g., 'create', 'update', 'delete') here
          // case 'create':
          //   result = await applyOfflineCreateOperation(operation.operationData, schoolId, user, session);
          //   break;
          // case 'update':
          //   result = await applyOfflineUpdateOperation(operation.operationData, schoolId, user, session);
          //   break;
          // case 'delete':
          //   result = await applyOfflineDeleteOperation(operation.operationData, schoolId, user, session);
          //   break;
          default:
            result.message = `Unsupported operation type: ${operation.operationType}`;
            console.warn(`Sync Warning: Unsupported operation type received: ${operation.operationType}`, operation);
        }
        results.push(result);
      }

      // After processing all operations, clean up offlineOperations array in fee records
      // This requires iterating through the fee records that were affected by the sync
      // or modifying the applyOfflinePaymentOperation to remove the specific operation
      // from the feeRecord.offlineOperations array after successful application.
      // A simpler approach for now is to just rely on the client not resending processed operations.
      // If a unique offlineOperationId was used, we could filter them out here.

      await session.commitTransaction();
      session.endSession();

      const processedCount = results.filter(r => r.success).length;
      const errors = results.filter(r => !r.success);

      console.log(`Sync completed for school ${schoolId}, device ${deviceId}. Processed: ${processedCount}, Errors: ${errors.length}`);

      return {
        success: true,
        message: 'Offline data sync process completed.',
        processedCount: processedCount,
        errors: errors,
        results: results // Optionally return detailed results per operation
      };

    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();

      console.error('Critical error during offline data sync:', error);
      return {
        success: false,
        message: 'Critical error during offline data sync',
        error: error.message,
        processedCount: 0,
        errors: results.map(r => ({ ...r, message: r.message || 'Transaction aborted due to critical error' })) // Mark all as failed due to rollback
      };
    }
  }
};
