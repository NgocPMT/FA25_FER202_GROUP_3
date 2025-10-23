export default function DropdownSelectStat({
  viewType,
  setViewType,
  openViewType,
  setOpenViewType,
  viewTypeRef,
  viewTypeWidth,
  selectedPeriod,
  setSelectedPeriod,
  openMonth,
  setOpenMonth,
  monthRef,
  monthWidth,
  months,
  quarters,
  years,
}) {
  return (
    <div className="flex items-center gap-4 mb-6 max-md:flex-col max-md:items-start max-md:gap-3 max-md:w-full">
      {/* Dropdown: Month / Quarter / Year */}
      <div
        ref={viewTypeRef}
        className="relative text-left max-md:block max-md:w-full"
      >
        <button
          onClick={() => setOpenViewType(!openViewType)}
          className="inline-flex items-center justify-between w-44 rounded-full bg-white border border-gray-200 cursor-pointer
              px-4 py-2 text-sm font-semibold text-gray-700 
              focus:outline-none focus:ring-1 focus:ring-gray-400 transition max-md:w-full"
        >
          {viewType}
          <svg
            className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
              openViewType ? "rotate-180" : "rotate-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {openViewType && (
          <div
            className="absolute right-0 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/10 z-10"
            style={{ width: `${viewTypeWidth}px` }}
          >
            <ul className="py-1 text-sm text-gray-700">
              {["Month", "Quarter", "Year"].map((type) => (
                <li key={type}>
                  <button
                    onClick={() => {
                      setViewType(type);
                      setSelectedPeriod(
                        type === "Month"
                          ? months[0]
                          : type === "Quarter"
                          ? quarters[0]
                          : years[0]
                      );
                      setOpenViewType(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition ${
                      viewType === type
                        ? "bg-white text-gray-900 font-medium hover:bg-gray-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>{type}</span>

                    {viewType === type && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-black"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dropdown Date/Quarter/Month/Year */}
      <div
        ref={monthRef}
        className="relative text-left max-md:block max-md:w-full"
      >
        <button
          onClick={() => setOpenMonth(!openMonth)}
          className="inline-flex items-center justify-between w-44 rounded-full bg-white border border-gray-200 cursor-pointer
                 px-4 py-2 text-sm font-semibold text-gray-700 
                 focus:outline-none focus:ring-1 focus:ring-gray-400 transition max-md:w-full"
        >
          {selectedPeriod}
          <svg
            className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
              openMonth ? "rotate-180" : "rotate-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {openMonth && (
          <div
            className="absolute right-0 mt-2 rounded-xl bg-white shadow-lg ring-1 ring-black/10 z-10"
            style={{ width: `${monthWidth}px` }}
          >
            <ul className="py-1 text-sm text-gray-700">
              {(viewType === "Month"
                ? months
                : viewType === "Quarter"
                ? quarters
                : years
              ).map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      setSelectedPeriod(item);
                      setOpenMonth(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition ${
                      selectedPeriod === item
                        ? "bg-white text-gray-900 font-medium hover:bg-gray-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>{item}</span>

                    {selectedPeriod === item && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-black"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
