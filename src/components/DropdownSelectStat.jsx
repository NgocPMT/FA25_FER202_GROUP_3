import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DropdownSelectStat({
  chartData = [],
  setFilteredData,
}) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // min/max date (max not exceed today)
  const computeBounds = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: today };
    }
    const all = data
      .map((d) => new Date(d.date))
      .filter((d) => d instanceof Date && !isNaN(d));
    if (all.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: today };
    }
    const minDate = new Date(Math.min(...all));
    const today = new Date();
    const maxDataDate = new Date(Math.max(...all));
    const maxDate = maxDataDate > today ? today : maxDataDate;
    return { minDate, maxDate };
  };

  const filterDataByDate = (start, end) => {
    if (!chartData || chartData.length === 0) {
      setFilteredData([]);
      return;
    }
    const startTime = start ? new Date(start).getTime() : null;
    const endTime = end ? new Date(end).getTime() : null;

    const filtered = chartData.filter((item) => {
      const t = new Date(item.date).getTime();
      if (startTime && endTime) return t >= startTime && t <= endTime;
      if (startTime) return t >= startTime;
      if (endTime) return t <= endTime;
      return true;
    });

    setFilteredData(filtered);
  };

  useEffect(() => {
    const { minDate, maxDate } = computeBounds(chartData);
    setFromDate(minDate);
    setToDate(maxDate);
    filterDataByDate(minDate, maxDate);
  }, [chartData]);

  const handleFromChange = (date) => {
    if (!date) return;
    const today = new Date();
    const picked = date > today ? today : date;
    setFromDate(picked);

    const safeTo = toDate && toDate < picked ? picked : toDate;
    if (safeTo !== toDate) setToDate(safeTo);

    filterDataByDate(picked, safeTo);
  };

  const handleToChange = (date) => {
    if (!date) return;
    const today = new Date();
    const picked = date > today ? today : date;

    const safeFrom = fromDate && picked < fromDate ? picked : fromDate;
    if (safeFrom !== fromDate) setFromDate(safeFrom);

    setToDate(picked);
    filterDataByDate(safeFrom, picked);
  };

  const { minDate: dataMinDate, maxDate: dataMaxDate } =
    computeBounds(chartData);
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
          onFocus={(e) => e.target.blur()}
          className="w-36 text-left rounded-full bg-white border border-gray-200 px-4 py-2 
                     text-sm font-semibold text-gray-700 cursor-pointer max-md:w-full
                     focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
          popperPlacement="bottom-start"
        />
      </div>
    </div>
  );
}
