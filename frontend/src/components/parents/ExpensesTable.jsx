import React, { useState } from "react";

const ExpensesTable = () => {
  const [searchExam, setSearchExam] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const expenses = [
    { id: "#0021", type: "Exam Fees", amount: "$150.00", status: "Paid", email: "akkhorschool@gmail.com", date: "22/02/2019" },
    { id: "#0022", type: "Semister Fees", amount: "$350.00", status: "Due", email: "akkhorschool@gmail.com", date: "22/02/2019" },
    { id: "#0023", type: "Exam Fees", amount: "$150.00", status: "Paid", email: "akkhorschool@gmail.com", date: "22/02/2019" },
    { id: "#0024", type: "Exam Fees", amount: "$150.00", status: "Due", email: "akkhorschool@gmail.com", date: "22/02/2019" },
    { id: "#0025", type: "Exam Fees", amount: "$150.00", status: "Paid", email: "akkhorschool@gmail.com", date: "22/02/2019" },
    { id: "#0026", type: "Semister Fees", amount: "$350.00", status: "Due", email: "akkhorschool@gmail.com", date: "22/02/2019" },
    { id: "#0027", type: "Exam Fees", amount: "$150.00", status: "Paid", email: "akkhorschool@gmail.com", date: "22/02/2019" },
  ];

  const filteredExpenses = expenses.filter(
    (item) =>
      item.type.toLowerCase().includes(searchExam.toLowerCase()) &&
      item.type.toLowerCase().includes(searchSubject.toLowerCase()) &&
      item.date.includes(searchDate)
  );

  return (
    <div className="col-span-8 bg-white shadow rounded p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">All Expenses</h2>

      {/* Search Inputs - Fit in Container */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4 w-full">
        <input
          type="text"
          placeholder="Search by Exam ..."
          value={searchExam}
          onChange={(e) => setSearchExam(e.target.value)}
          className="flex-1 min-w-[150px] max-w-[270px] border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Search by Subject ..."
          value={searchSubject}
          onChange={(e) => setSearchSubject(e.target.value)}
          className="flex-1 min-w-[150px] max-w-[270px] border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="flex-1 min-w-[150px] max-w-[270px] border rounded px-2 py-1"
        />
        <button className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 whitespace-nowrap">
          SEARCH
        </button>
      </div>


      {/* Table */}
      <table className="w-full text-sm table-auto border-collapse">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Expense</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">E-Mail</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.type}</td>
              <td className="p-2">{item.amount}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-white text-xs ${item.status === "Paid" ? "bg-green-500" : "bg-red-500"}`}>
                  {item.status}
                </span>
              </td>
              <td className="p-2">{item.email}</td>
              <td className="p-2">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-4 gap-2">
        <button className="text-gray-500 hover:text-black">Previous</button>
        <span className="px-3 py-1 bg-yellow-400 text-white rounded">1</span>
        <button className="text-gray-500 hover:text-black">Next</button>
      </div>
    </div>
  );
};

export default ExpensesTable;
