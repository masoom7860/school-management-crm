import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function CalendarWithTime() {
    const [currentTime, setCurrentTime] = useState(dayjs());
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getDaysInMonth = () => {
        const start = currentTime.startOf("month");
        const end = currentTime.endOf("month");
        const days = [];

        let day = start.startOf("week");
        while (day.isBefore(end.endOf("week"))) {
            days.push(day);
            day = day.add(1, "day");
        }
        return days;
    };

    const days = getDaysInMonth();

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {currentTime.format("dddd, MMMM D, YYYY")}
                </h1>
                <p className="text-4xl text-red-600 font-mono mt-2">
                    {currentTime.format("hh:mm:ss A")}
                </p>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
                {daysOfWeek.map((day, index) => (
                    <div key={index} className="font-semibold text-gray-600">
                        {day}
                    </div>
                ))}

                {days.map((day, index) => {
                    const isCurrentMonth = day.month() === currentTime.month();
                    const isToday = day.isSame(currentTime, "day");

                    return (
                        <div
                            key={index}
                            className={`py-2 rounded-lg text-sm font-medium ${isToday
                                ? "bg-red-500 text-white"
                                : isCurrentMonth
                                    ? "text-gray-800"
                                    : "text-gray-400"
                                }`}
                        >
                            {day.date()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
