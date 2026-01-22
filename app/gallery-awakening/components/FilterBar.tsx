"use client";

import React from "react";
import "../gallery.css";

type FilterOption = "Latest" | "Oldest" | "Most Viewed";

type FilterBarProps = {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
};

const filterOptions: FilterOption[] = ["Latest", "Oldest", "Most Viewed"];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="filter-bar flex items-center justify-center gap-4">
      {filterOptions.map((option) => (
        <button
          key={option}
          className={`filter-button ${activeFilter === option ? "active" : ""}`}
          onClick={() => onFilterChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
