import React from 'react'
import SuperDashboard from './SuperDashboard'
import SchoolList from './SchoolList'
import CreateSchoolForm from './CraeteSchoolForm'
import SubscriptionReport from './SubscriptionReport '
import ExpiredSubscriptionReport from './ExpiredSubscriptionReport'
import PendingRequest from './PendingRequest'
import { Package } from 'lucide-react'
import ManageAddons from './ManageAddons'
import SystemSettings from './SystemSettings'
import WebsiteSettings from './WebsiteSettings'
import ManageFAQ from './ManageFAQ'
import PaymentSystem from './PaymentSystem'
import SmtpSetting from './SmtpSetting'
import AboutSection from './AboutSection'




const AdminData = () => {
  return (
    <div>
       <SuperDashboard/>
       {/* <SchoolList/>
       <CreateSchoolForm/>
       <SubscriptionReport/>
       <ExpiredSubscriptionReport/>
       <PendingRequest/>
      <Package/>
      <ManageAddons/>
      <SystemSettings/>
      <WebsiteSettings/>
      <ManageFAQ/>
      <PaymentSystem/>
      <SmtpSetting/>
      <AboutSection/> */}
     
    </div>
  )
}

export default AdminData
