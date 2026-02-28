import ExpensesTable from './ExpensesTable'
import KidsInfo from './KidsInfo'
import ParentsDash from './ParentsDash'
import NotificationsComponent from './NotificationsComponent'
import ExamResultsComponent from './ExamResultsComponent'

const TeacherData = () => {
    return (
        <div>
            <ParentsDash />
            <div className="grid grid-cols-12 gap-4 p-6">
                <KidsInfo />
                <ExpensesTable />
            </div>
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 ">
                <NotificationsComponent />
                <ExamResultsComponent />

            </div>
            <p className='pt-5'>
                © Copyrights akkhor 2019. All rights reserved. Designed by PsdBosS
            </p>
        </div>
    )
}

export default TeacherData
