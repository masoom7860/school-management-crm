import React from "react";
import EventCalendar from "./EventCalendar";
import WebsiteTraffic from "./WebsiteTraffic";
import Noticeboard from "./Noticeboard";

const ThirdDashboardAdmin = () => {
  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <EventCalendar />
      <WebsiteTraffic />
      <Noticeboard />
    </div>
  );
};

export default ThirdDashboardAdmin;
