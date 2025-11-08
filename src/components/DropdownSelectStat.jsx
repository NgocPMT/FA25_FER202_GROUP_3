import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DropdownSelectStat({
  chartData = [],
  setFilteredData,
}) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  // DatePicker dropdown open/close state
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  // Normalize timestamp to start of day (00:00)
  const normalizeStart = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  // Normalize timestamp to end of day (23:59)
  const normalizeEnd = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  };
  // minDate and maxDate based on all data
  const computeBounds = () => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: today };
    }
    //// Get all days in chartData
    const allDates = chartData
      .map((d) => new Date(d.date))
      .filter((d) => !isNaN(d));

    if (allDates.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: today };
    }

    const minDate = new Date(Math.min(...allDates));
    const today = new Date();
    const maxDataDate = new Date(Math.max(...allDates));
    const maxDate = maxDataDate > today ? today : maxDataDate;

    return { minDate, maxDate };
  };
  // Filter data by date range
  const filterDataByDate = (start, end) => {
    if (!chartData || chartData.length === 0) {
      setFilteredData([]);
      return;
    }

    const startTime = start ? normalizeStart(start) : null;
    const endTime = end ? normalizeEnd(end) : null;

    const filtered = chartData.filter((item) => {
      const t = normalizeStart(item.date);

      if (startTime && endTime) return t >= startTime && t <= endTime;
      if (startTime) return t >= startTime;
      if (endTime) return t <= endTime;

      return true;
    });

    setFilteredData(filtered);
  };
  /*
  When chartData first loads → automatically set:
  - fromDate = minDate (first post date)
  - toDate = maxDate (latest date)
  */
  useEffect(() => {
    const { minDate, maxDate } = computeBounds();
    setFromDate(minDate);
    setToDate(maxDate);
    filterDataByDate(minDate, maxDate);
  }, [chartData]);
  // Handling when user changes "From" date
  const handleFromChange = (date) => {
    if (!date) return;

    const today = new Date();
    const picked = date > today ? today : date;

    setFromDate(picked);

    const safeTo = toDate && toDate < picked ? picked : toDate;
    setToDate(safeTo);

    filterDataByDate(picked, safeTo);
  };
  // Handling when user changes date "To"
  const handleToChange = (date) => {
    if (!date) return;

    const today = new Date();
    const picked = date > today ? today : date;

    const safeFrom = fromDate && picked < fromDate ? picked : fromDate;
    setFromDate(safeFrom);

    setToDate(picked);

    filterDataByDate(safeFrom, picked);
  };

  const { minDate: dataMinDate, maxDate: dataMaxDate } = computeBounds();
  const today = new Date();
  const maxSelectable = today;

  return (
    <div className="flex items-center gap-4 mb-6 max-md:flex-col max-md:items-start max-md:w-full">
      {/* From */}
      <div className="flex flex-col w-36 max-md:w-full">
        <label className="text-xs font-medium text-gray-500 mb-1">From</label>

        <DatePicker
          selected={fromDate}
          onChange={handleFromChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
          minDate={dataMinDate}
          maxDate={maxSelectable}
          open={openFrom}
          onClickOutside={() => setOpenFrom(false)}
          onSelect={() => setOpenFrom(false)}
          onInputClick={() => setOpenFrom((prev) => !prev)}
          onFocus={(e) => e.target.blur()}
          className="w-36 rounded-full bg-white text-left border border-gray-200 px-4 py-2 
                     text-sm font-semibold text-gray-700 cursor-pointer max-md:w-full
                     focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
          popperPlacement="bottom-start"
        />
      </div>

      {/* To */}
      <div className="flex flex-col w-36 max-md:w-full">
        <label className="text-xs font-medium text-gray-500 mb-1">To</label>

        <DatePicker
          selected={toDate}
          onChange={handleToChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
          minDate={fromDate || dataMinDate}
          maxDate={maxSelectable}
          open={openTo}
          onClickOutside={() => setOpenTo(false)}
          onSelect={() => setOpenTo(false)}
          onInputClick={() => setOpenTo((prev) => !prev)}
          onFocus={(e) => e.target.blur()}
          className="w-36 rounded-full bg-white text-left border border-gray-200 px-4 py-2 
                     text-sm font-semibold text-gray-700 cursor-pointer max-md:w-full
                     focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
          popperPlacement="bottom-start"
        />
      </div>
    </div>
  );
}
