import { useState, useEffect } from "react";
import { BellRing, FileCheck, Calendar } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";

// Calendar Component (defined outside)
const CalendarComponent = ({ date, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    // Get today's date (without time for accurate comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set selected date to start of day for comparison
    selectedDate.setHours(0, 0, 0, 0);
    
    // Only allow today's date or future dates
    if (selectedDate >= today) {
      onChange(selectedDate);
      onClose();
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    onChange(today);
    onClose();
  };

  const renderDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
    const firstDayOfMonth = getFirstDayOfMonth(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      dayDate.setHours(0, 0, 0, 0);
      
      const isSelected =
        date &&
        date.getDate() === day &&
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear();

      const isPastDate = dayDate < today;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isPastDate}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
            isPastDate
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isSelected
              ? "bg-purple-600 text-white"
              : "hover:bg-purple-100 text-gray-700"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  return (
    <div className="p-2 bg-white border border-gray-200 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          &lt;
        </button>
        <div className="text-sm font-medium">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {currentMonth.getFullYear()}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          &gt;
        </button>
      </div>
      
      {/* Add Today button */}
      <div className="mb-2 text-center">
        <button
          type="button"
          onClick={handleTodayClick}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Today
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
};

// Helper functions for date manipulation
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const addYears = (date, years) => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
};

export default function AssignTask() {
  const [date, setSelectedDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Add file upload state variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Add new state variables for dropdown options
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [givenByOptions, setGivenByOptions] = useState([]);
  const [doerOptions, setDoerOptions] = useState([]);

  const [selectedDoers, setSelectedDoers] = useState([]);
  const [isDoerDropdownOpen, setIsDoerDropdownOpen] = useState(false);
  const [doerSearchTerm, setDoerSearchTerm] = useState("");
  const [customFrequencyCount, setCustomFrequencyCount] = useState(1);

  const frequencies = [
    { value: "one-time", label: "One Time (No Recurrence)" },
    { value: "daily", label: "Daily" },
    { value: "custom", label: "Custom" },
    { value: "weekly", label: "Weekly" },
    { value: "fortnightly", label: "Fortnightly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
    { value: "end-of-1st-week", label: "End of 1st Week" },
    { value: "end-of-2nd-week", label: "End of 2nd Week" },
    { value: "end-of-3rd-week", label: "End of 3rd Week" },
    { value: "end-of-4th-week", label: "End of 4th Week" },
    { value: "end-of-last-week", label: "End of Last Week" },
  ];

  const [formData, setFormData] = useState({
    department: "",
    givenBy: sessionStorage.getItem('userFullName') || "",
    doer: [],
    description: "",
    frequency: "daily",
    enableReminders: true,
    requireAttachment: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  // Function to fetch options from master sheet
  const fetchMasterSheetOptions = async () => {
    try {
      const masterSheetId = "1nvU1bQOkLNMwatRSbcTPJd0vhDGeqrhY8gL1s0YWGww";
      const masterSheetName = "master";

      const url = `https://docs.google.com/spreadsheets/d/${masterSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        masterSheetName
      )}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch master data: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);

      if (!data.table || !data.table.rows) {
        console.log("No master data found");
        return;
      }

      // Extract options from columns A, B, and C
      const departments = [];
      const givenBy = [];
      const doers = [];

      // Process all rows starting from index 1 (skip header)
      data.table.rows.slice(1).forEach((row) => {
        // Column A - Departments
        if (row.c && row.c[0] && row.c[0].v) {
          const value = row.c[0].v.toString().trim();
          if (value !== "") {
            departments.push(value);
          }
        }
        // Column B - Given By
        if (row.c && row.c[1] && row.c[1].v) {
          const value = row.c[1].v.toString().trim();
          if (value !== "") {
            givenBy.push(value);
          }
        }
        // Column C - Doers
        if (row.c && row.c[2] && row.c[2].v) {
          const value = row.c[2].v.toString().trim();
          if (value !== "") {
            doers.push(value);
          }
        }
      });

      // Remove duplicates and sort
      setDepartmentOptions([...new Set(departments)].sort());
      setGivenByOptions([...new Set(givenBy)].sort());
      setDoerOptions([...new Set(doers)].sort());

      console.log("Master sheet options loaded successfully", {
        departments: [...new Set(departments)],
        givenBy: [...new Set(givenBy)],
        doers: [...new Set(doers)],
      });
    } catch (error) {
      console.error("Error fetching master sheet options:", error);
      // Set default options if fetch fails
      setDepartmentOptions(["Department 1", "Department 2"]);
      setGivenByOptions(["User 1", "User 2"]);
      setDoerOptions(["Doer 1", "Doer 2"]);
    }
  };

  // Update date display format
  const getFormattedDate = (date) => {
    if (!date) return "Select a date";
    return formatDate(date);
  };

  useEffect(() => {
    fetchMasterSheetOptions();
  }, []);

  // Add a function to get the last task ID from the specified sheet
  const getLastTaskId = async (sheetName) => {
    try {
      const url = `https://docs.google.com/spreadsheets/d/1nvU1bQOkLNMwatRSbcTPJd0vhDGeqrhY8gL1s0YWGww/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        sheetName
      )}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);

      if (!data.table || !data.table.rows || data.table.rows.length === 0) {
        return 0; // Start from 1 if no tasks exist
      }

      // Get the last task ID from column B (index 1)
      let lastTaskId = 0;
      data.table.rows.forEach((row) => {
        if (row.c && row.c[1] && row.c[1].v) {
          const taskId = parseInt(row.c[1].v);
          if (!isNaN(taskId) && taskId > lastTaskId) {
            lastTaskId = taskId;
          }
        }
      });

      return lastTaskId;
    } catch (error) {
      console.error("Error fetching last task ID:", error);
      return 0;
    }
  };

  const handleDoerToggle = (doer) => {
    const updatedDoers = selectedDoers.includes(doer)
      ? selectedDoers.filter(d => d !== doer)
      : [...selectedDoers, doer];

    setSelectedDoers(updatedDoers);
    setFormData(prev => ({ ...prev, doer: updatedDoers }));
  };

  const handleDoerRemove = (doerToRemove) => {
    const updatedDoers = selectedDoers.filter(doer => doer !== doerToRemove);
    setSelectedDoers(updatedDoers);
    setFormData(prev => ({ ...prev, doer: updatedDoers }));
  };

  const filteredDoerOptions = doerOptions.filter(doer =>
    doer.toLowerCase().includes(doerSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      // More specific selector for the doer dropdown
      const doerDropdown = event.target.closest('[data-doer-dropdown]');
      if (isDoerDropdownOpen && !doerDropdown) {
        setIsDoerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDoerDropdownOpen]);

  // Add this date formatting helper function
  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to fetch working days from the Working Day Calendar sheet
  const fetchWorkingDays = async () => {
    try {
      const sheetId = "1nvU1bQOkLNMwatRSbcTPJd0vhDGeqrhY8gL1s0YWGww";
      const sheetName = "Working Day Calendar";

      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        sheetName
      )}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch working days: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);

      if (!data.table || !data.table.rows) {
        console.log("No working day data found");
        return [];
      }

      // Extract dates from column A
      const workingDays = [];
      data.table.rows.forEach((row) => {
        if (row.c && row.c[0] && row.c[0].v) {
          let dateValue = row.c[0].v;

          // Handle Google Sheets Date(year,month,day) format
          if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
            const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue);
            if (match) {
              const year = parseInt(match[1], 10);
              const month = parseInt(match[2], 10); // 0-indexed in Google's format
              const dateDay = parseInt(match[3], 10);

              dateValue = `${dateDay.toString().padStart(2, "0")}/${(month + 1)
                .toString()
                .padStart(2, "0")}/${year}`;
            }
          } else if (dateValue instanceof Date) {
            // If it's a Date object
            dateValue = formatDateToDDMMYYYY(dateValue);
          }

          // Add to working days if it's a valid date string
          if (
            typeof dateValue === "string" &&
            dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)
          ) {
            workingDays.push(dateValue);
          }
        }
      });

      console.log(`Fetched ${workingDays.length} working days`);
      return workingDays;
    } catch (error) {
      console.error("Error fetching working days:", error);
      return []; // Return empty array if fetch fails
    }
  };

  // Helper function to find the closest working day to a target date
  const findClosestWorkingDayIndex = (workingDays, targetDateStr) => {
    // Parse the target date
    const [targetDay, targetMonth, targetYear] = targetDateStr.split('/').map(Number);
    const targetDate = new Date(targetYear, targetMonth - 1, targetDay);

    // Find the closest working day (preferably after the target date)
    let closestIndex = -1;
    let minDifference = Infinity;

    for (let i = 0; i < workingDays.length; i++) {
      const [workingDay, workingMonth, workingYear] = workingDays[i].split('/').map(Number);
      const currentDate = new Date(workingYear, workingMonth - 1, workingDay);

      // Calculate difference in days
      const difference = Math.abs((currentDate - targetDate) / (1000 * 60 * 60 * 24));

      if (currentDate >= targetDate && difference < minDifference) {
        minDifference = difference;
        closestIndex = i;
      }
    }

    // Return -1 if no working day found after the target date
    // Don't return any fallback index
    return closestIndex;
  };

  // Helper function to find the date for the end of a specific week in a month
  const findEndOfWeekDate = (date, weekNumber, workingDays) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get all working days in the target month
    const daysInMonth = workingDays.filter(dateStr => {
      const [, m, y] = dateStr.split('/').map(Number);
      return y === year && m === month + 1;
    });

    // Sort them chronologically
    daysInMonth.sort((a, b) => {
      const [dayA] = a.split('/').map(Number);
      const [dayB] = b.split('/').map(Number);
      return dayA - dayB;
    });

    // Group by weeks (assuming Monday is the first day of the week)
    const weekGroups = [];
    let currentWeek = [];
    let lastWeekDay = -1;

    for (const dateStr of daysInMonth) {
      const [workingDay2, m, y] = dateStr.split('/').map(Number);
      const dateObj = new Date(y, m - 1, workingDay2);
      const weekDay = dateObj.getDay(); // 0 for Sunday, 1 for Monday, etc.

      if (weekDay <= lastWeekDay || currentWeek.length === 0) {
        if (currentWeek.length > 0) {
          weekGroups.push(currentWeek);
        }
        currentWeek = [dateStr];
      } else {
        currentWeek.push(dateStr);
      }

      lastWeekDay = weekDay;
    }

    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }

    // Return the last day of the requested week
    if (weekNumber === -1) {
      // Last week of the month
      return weekGroups[weekGroups.length - 1]?.[weekGroups[weekGroups.length - 1].length - 1] || daysInMonth[daysInMonth.length - 1];
    } else if (weekNumber > 0 && weekNumber <= weekGroups.length) {
      // Specific week
      return weekGroups[weekNumber - 1]?.[weekGroups[weekNumber - 1].length - 1] || daysInMonth[daysInMonth.length - 1];
    } else {
      // Default to the last day of the month if the requested week doesn't exist
      return daysInMonth[daysInMonth.length - 1];
    }
  };

  // Updated generateTasks function that only creates tasks for dates in the Working Day Calendar
  const generateTasks = async () => {
    if (!date || selectedDoers.length === 0 || !formData.description || !formData.frequency) {
      alert("Please fill in all required fields.");
      return;
    }

    // Fetch working days from the sheet
    const workingDays = await fetchWorkingDays();
    if (workingDays.length === 0) {
      alert("Could not retrieve working days. Please make sure the Working Day Calendar sheet is properly set up.");
      return;
    }

    // Sort the working days chronologically
    const sortedWorkingDays = [...workingDays].sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });

    // Convert selected date to same format
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    const startDateStr = formatDateToDDMMYYYY(selectedDate);

    // Filter out dates before the selected date (no back dates)
    const futureDates = sortedWorkingDays.filter(dateStr => {
      const [dateDay, month, year] = dateStr.split('/').map(Number);
      const dateObj = new Date(year, month - 1, dateDay);
      dateObj.setHours(0, 0, 0, 0);
      const selectedDateCopy = new Date(selectedDate);
      selectedDateCopy.setHours(0, 0, 0, 0);
  
  return dateObj >= selectedDateCopy;    });

    // If no future working days are available from the selected date
    if (futureDates.length === 0) {
      alert("No working days found on or after your selected date. Please choose a different start date or update the Working Day Calendar.");
      return;
    }

    // Find the start date in working days
    let startIndex = futureDates.findIndex(d => d === startDateStr);

    // If the exact start date isn't found, use the next available working day
    if (startIndex === -1) {
      startIndex = 0; // Use the first available future working day
      alert(`The selected date (${startDateStr}) is not in the Working Day Calendar. The next available working day will be used instead: ${futureDates[0]}`);
    }

    const tasks = [];

    if (formData.frequency === "custom") {
      // For custom frequency, generate tasks with incrementing dates
      let currentIndex = startIndex;
      
      // Create the specified number of tasks with incrementing dates
      for (let i = 0; i < customFrequencyCount; i++) {
        // Check if we have enough working days
        if (currentIndex >= futureDates.length) {
          alert(`Only ${i} tasks could be generated due to limited working days in the calendar.`);
          break;
        }
        
        const taskDateStr = futureDates[currentIndex];
        
        // Create a task for each selected doer
        selectedDoers.forEach(doer => {
          tasks.push({
            description: formData.description,
            department: formData.department,
            givenBy: formData.givenBy,
            doer: doer,
            dueDate: taskDateStr,
            status: "pending",
            frequency: "custom",
            enableReminders: formData.enableReminders,
            requireAttachment: formData.requireAttachment,
          });
        });
        
        // Move to the next working day for the next task
        currentIndex += 1;
      }
    } else if (formData.frequency === "one-time") {
      // For one-time tasks, just use the first available date
      const taskDateStr = futureDates[startIndex];

      // Create a task for each selected doer
      selectedDoers.forEach(doer => {
        tasks.push({
          description: formData.description,
          department: formData.department,
          givenBy: formData.givenBy,
          doer: doer,
          dueDate: taskDateStr,
          status: "pending",
          frequency: formData.frequency,
          enableReminders: formData.enableReminders,
          requireAttachment: formData.requireAttachment,
        });
      });
    } else {
      // For other recurring tasks (existing logic)
      let currentIndex = startIndex;
      while (currentIndex < futureDates.length) {
        const taskDateStr = futureDates[currentIndex];

        // Create a task for each selected doer
        selectedDoers.forEach(doer => {
          tasks.push({
            description: formData.description,
            department: formData.department,
            givenBy: formData.givenBy,
            doer: doer,
            dueDate: taskDateStr,
            status: "pending",
            frequency: formData.frequency,
            enableReminders: formData.enableReminders,
            requireAttachment: formData.requireAttachment,
          });
        });

        // Determine the next index based on frequency
        switch (formData.frequency) {
          case "daily": {
            currentIndex += 1; // Next working day
            break;
          }
          case "weekly": {
            // Find a working day approximately 7 calendar days later
            const [taskDay, taskMonth, taskYear] = taskDateStr.split('/').map(Number);
            const currentDate = new Date(taskYear, taskMonth - 1, taskDay);
            const targetDate = addDays(currentDate, 7);
            const targetDateStr = formatDateToDDMMYYYY(targetDate);

            // Find the next working day closest to the target date
            const nextIndex = findClosestWorkingDayIndex(futureDates, targetDateStr);
            // Only continue if we found a valid next date (not -1) and it's greater than current
            if (nextIndex !== -1 && nextIndex > currentIndex) {
              currentIndex = nextIndex;
            } else {
              currentIndex = futureDates.length; // Exit the loop
            }
            break;
          }
          case "fortnightly": {
            // Find a working day approximately 14 calendar days later
            const [taskDay2, taskMonth2, taskYear2] = taskDateStr.split('/').map(Number);
            const currentDate2 = new Date(taskYear2, taskMonth2 - 1, taskDay2);
            const targetDate2 = addDays(currentDate2, 14);
            const targetDateStr2 = formatDateToDDMMYYYY(targetDate2);

            const nextIndex2 = findClosestWorkingDayIndex(futureDates, targetDateStr2);
            // Only continue if we found a valid next date (not -1) and it's greater than current
            if (nextIndex2 !== -1 && nextIndex2 > currentIndex) {
              currentIndex = nextIndex2;
            } else {
              currentIndex = futureDates.length; // Exit the loop
            }
            break;
          }
          case "monthly": {
            // Find a working day approximately 1 month later
            const [taskDay3, taskMonth3, taskYear3] = taskDateStr.split('/').map(Number);
            const currentDate3 = new Date(taskYear3, taskMonth3 - 1, taskDay3);
            const targetDate3 = addMonths(currentDate3, 1);
            const targetDateStr3 = formatDateToDDMMYYYY(targetDate3);

            const nextIndex3 = findClosestWorkingDayIndex(futureDates, targetDateStr3);
            // Only continue if we found a valid next date (not -1) and it's greater than current
            if (nextIndex3 !== -1 && nextIndex3 > currentIndex) {
              currentIndex = nextIndex3;
            } else {
              currentIndex = futureDates.length; // Exit the loop
            }
            break;
          }
          case "quarterly": {
            // Find a working day approximately 3 months later
            const [taskDay4, taskMonth4, taskYear4] = taskDateStr.split('/').map(Number);
            const currentDate4 = new Date(taskYear4, taskMonth4 - 1, taskDay4);
            const targetDate4 = addMonths(currentDate4, 3);
            const targetDateStr4 = formatDateToDDMMYYYY(targetDate4);

            const nextIndex4 = findClosestWorkingDayIndex(futureDates, targetDateStr4);
            // Only continue if we found a valid next date (not -1) and it's greater than current
            if (nextIndex4 !== -1 && nextIndex4 > currentIndex) {
              currentIndex = nextIndex4;
            } else {
              currentIndex = futureDates.length; // Exit the loop
            }
            break;
          }
          case "yearly": {
            // Find a working day approximately 1 year later
            const [taskDay5, taskMonth5, taskYear5] = taskDateStr.split('/').map(Number);
            const currentDate5 = new Date(taskYear5, taskMonth5 - 1, taskDay5);
            const targetDate5 = addYears(currentDate5, 1);
            const targetDateStr5 = formatDateToDDMMYYYY(targetDate5);

            const nextIndex5 = findClosestWorkingDayIndex(futureDates, targetDateStr5);
            // Only continue if we found a valid next date (not -1) and it's greater than current
            if (nextIndex5 !== -1 && nextIndex5 > currentIndex) {
              currentIndex = nextIndex5;
            } else {
              currentIndex = futureDates.length; // Exit the loop
            }
            break;
          }
          case "end-of-1st-week":
          case "end-of-2nd-week":
          case "end-of-3rd-week":
          case "end-of-4th-week":
          case "end-of-last-week": {
            // These would need special handling based on your calendar's definition of weeks
            // For now, we'll just move to the next month and find the appropriate week
            const [taskDay6, taskMonth6, taskYear6] = taskDateStr.split('/').map(Number);
            const currentDate6 = new Date(taskYear6, taskMonth6 - 1, taskDay6);
            const targetDate6 = addMonths(currentDate6, 1);

            // Find the appropriate week in the next month
            let weekNumber;
            switch (formData.frequency) {
              case "end-of-1st-week": weekNumber = 1; break;
              case "end-of-2nd-week": weekNumber = 2; break;
              case "end-of-3rd-week": weekNumber = 3; break;
              case "end-of-4th-week": weekNumber = 4; break;
              case "end-of-last-week": weekNumber = -1; break; // Special case for last week
            }

            const targetDateStr6 = findEndOfWeekDate(targetDate6, weekNumber, futureDates);
            const nextIndex6 = futureDates.indexOf(targetDateStr6);
            currentIndex = nextIndex6 > currentIndex ? nextIndex6 : futureDates.length;
            break;
          }
          default: {
            currentIndex = futureDates.length; // Exit the loop if frequency is not recognized
          }
        }
      }
    }

    setGeneratedTasks(tasks);
    setAccordionOpen(true);
  };

  // Updated handleSubmit function with file upload logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (generatedTasks.length === 0) {
        alert("Please generate tasks first by clicking Preview Generated Tasks");
        setIsSubmitting(false);
        return;
      }

      // File upload logic
     // File upload logic
// File upload logic - Simplified version
// File upload logic - EXACT WORKING VERSION
let imageUrl = null;
if (selectedFile) {
  try {
    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    const base64Data = await fileToBase64(selectedFile);

    const uploadFormData = new FormData();
    uploadFormData.append("action", "uploadFile");
    uploadFormData.append("base64Data", base64Data);
    uploadFormData.append(
      "fileName", 
      `task_${Date.now()}.${selectedFile.name.split(".").pop()}`
    );
    uploadFormData.append("mimeType", selectedFile.type);
    uploadFormData.append("folderId", "1eAqzUds6SFYIJYlYtxB8gVx3QLS8OZaI");

    const uploadResponse = await fetch(
      "https://script.google.com/macros/s/AKfycbxDEgWct4VVx7Oh81zMxwl1UsvretjqrCy9X7XlOoIqy9LXmGAAIlx-6Wvx3dZha0Xr/exec",
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const uploadResult = await uploadResponse.json();
    if (uploadResult.success) {
      imageUrl = uploadResult.fileUrl;
      console.log("File uploaded successfully:", imageUrl);
    } else {
      console.error("File upload failed:", uploadResult);
      alert("File upload failed. The task will be created without the file.");
    }
  } catch (uploadError) {
    console.error("Error uploading image:", uploadError);
    alert("File upload failed. The task will be created without the file.");
  }
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};


      // Determine the sheet based on frequency:
      // - "one-time" frequency → DELEGATION sheet (department doesn't matter)
      // - All other frequencies → Checklist sheet
      const submitSheetName = formData.frequency === "one-time" ? "DELEGATION" : "Checklist";

      // Get the last task ID from the appropriate sheet
      const lastTaskId = await getLastTaskId(submitSheetName);
      let nextTaskId = lastTaskId + 1;

      // Prepare all tasks data for batch insertion
      const tasksData = generatedTasks.map((task, index) => ({
        timestamp: formatDateToDDMMYYYY(new Date()),
        taskId: (nextTaskId + index).toString(),
        firm: task.department,
        givenBy: formData.givenBy,
        name: task.doer,
        description: task.description,
        startDate: task.dueDate,
        freq: task.frequency,
        enableReminders: task.enableReminders ? "Yes" : "No",
        requireAttachment: task.requireAttachment ? "Yes" : "No",
        // Add file URL for different sheets
        fileUrl: imageUrl  // This will be added to column P for Checklist or column T for DELEGATION
      }));

      console.log(`Submitting ${tasksData.length} tasks in batch to ${submitSheetName} sheet:`, tasksData);

      // Submit all tasks in one batch to Google Sheets
      const formPayload = new FormData();
      formPayload.append("sheetName", submitSheetName);
      formPayload.append("action", "insert");
      formPayload.append("batchInsert", "true");
      formPayload.append("rowData", JSON.stringify(tasksData));

      await fetch(
        "https://script.google.com/macros/s/AKfycbxDEgWct4VVx7Oh81zMxwl1UsvretjqrCy9X7XlOoIqy9LXmGAAIlx-6Wvx3dZha0Xr/exec",
        {
          method: "POST",
          body: formPayload,
          mode: "no-cors",
        }
      );

      // Show a success message with the appropriate sheet name
      alert(`Successfully submitted ${generatedTasks.length} tasks to ${submitSheetName} sheet in one batch!`);

      // Reset form
      setFormData({
        department: "",
        givenBy: sessionStorage.getItem('userFullName') || "",
        doer: [],
        description: "",
        frequency: "daily",
        enableReminders: true,
        requireAttachment: false
      });
      setSelectedDate(null);
      setSelectedDoers([]);
      setSelectedFile(null);
      setFilePreview(null);
      setGeneratedTasks([]);
      setAccordionOpen(false);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to assign tasks. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-purple-500">
          Assign New Task
        </h1>
        <div className="rounded-lg border border-purple-200 bg-white shadow-md overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
              <h2 className="text-xl font-semibold text-purple-700">
                Task Details
              </h2>
              <p className="text-purple-600">
                Fill in the details to assign a new task to a staff member.
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Department Name Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-purple-700"
                >
                  Department Name
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Given By - Read Only */}
              <div className="space-y-2">
                <label
                  htmlFor="givenBy"
                  className="block text-sm font-medium text-purple-700"
                >
                  Given By
                </label>
                <div className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-purple-50 text-purple-700">
                  {sessionStorage.getItem('userFullName') || "Current User"}
                </div>
                <input
                  type="hidden"
                  id="givenBy"
                  name="givenBy"
                  value={sessionStorage.getItem('userFullName') || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Doer's Name Dropdown */}
              <div className="space-y-2">
                <label
                  htmlFor="doer"
                  className="block text-sm font-medium text-purple-700"
                >
                  Doer's Name
                </label>
                <div className="relative" data-doer-dropdown>
                  <div
                    onClick={() => setIsDoerDropdownOpen(!isDoerDropdownOpen)}
                    className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer min-h-[42px] flex items-center justify-between"
                  >
                    <div className="flex flex-wrap gap-1">
                      {selectedDoers.length === 0 ? (
                        <span className="text-gray-500">Select Doer(s)</span>
                      ) : (
                        selectedDoers.map((doer, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-sm"
                          >
                            {doer}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDoerRemove(doer);
                              }}
                              className="ml-1 text-purple-500 hover:text-purple-700"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-purple-500 transition-transform ${isDoerDropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {isDoerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-purple-100">
                        <input
                          type="text"
                          placeholder="Search doers..."
                          value={doerSearchTerm}
                          onChange={(e) => setDoerSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Options List */}
                      <div className="max-h-40 overflow-y-auto">
                        {filteredDoerOptions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No doers found</div>
                        ) : (
                          filteredDoerOptions.map((doer, index) => (
                            <div
                              key={index}
                              onClick={() => handleDoerToggle(doer)}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 flex items-center justify-between ${selectedDoers.includes(doer) ? "bg-purple-100 text-purple-700" : ""
                                }`}
                            >
                              <span>{doer}</span>
                              {selectedDoers.includes(doer) && (
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedDoers.length > 0 && (
                  <div className="text-xs text-purple-600">
                    {selectedDoers.length} doer(s) selected
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-purple-700"
                >
                  Task Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  rows={4}
                  required
                  className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-purple-700">
                  Upload File (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        // Create preview URL for images
                        if (file.type.startsWith('image/')) {
                          setFilePreview(URL.createObjectURL(file));
                        } else {
                          setFilePreview(null);
                        }
                      }
                    }}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="w-full flex justify-center items-center rounded-md border-2 border-dashed border-purple-200 p-4 cursor-pointer hover:border-purple-300 hover:bg-purple-50"
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-purple-600 mt-1">
                        {selectedFile ? selectedFile.name : "Click to upload file"}
                      </p>
                    </div>
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-purple-50 rounded border">
                    <p className="text-xs text-purple-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    {filePreview && (
                      <img src={filePreview} alt="Preview" className="mt-2 max-w-32 h-auto rounded" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="mt-1 text-xs text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>

              {/* Date and Frequency */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-700">
                    Task Start Date
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full flex justify-start items-center rounded-md border border-purple-200 p-2 text-left focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                        {date ? getFormattedDate(date) : "Select a date"}
                      </button>
                      {showCalendar && (
                        <div className="absolute z-10 mt-1">
                          <CalendarComponent
                            date={date}
                            onChange={setSelectedDate}
                            onClose={() => setShowCalendar(false)}
                          />
                        </div>
                      )}
                    </div>
                    {/* Today Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setSelectedDate(today);
                        setShowCalendar(false);
                      }}
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-nowrap"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="frequency"
                    className="block text-sm font-medium text-purple-700"
                  >
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                  {formData.frequency === "custom" && (
                    <div className="mt-2">
                      <label
                        htmlFor="customFrequency"
                        className="block text-sm font-medium text-purple-700"
                      >
                        Number of Tasks to Generate
                      </label>
                      <input
                        type="number"
                        id="customFrequency"
                        name="customFrequency"
                        min="1"
                        max="100"
                        value={customFrequencyCount}
                        onChange={(e) => setCustomFrequencyCount(parseInt(e.target.value))}
                        className="w-full rounded-md border border-purple-200 p-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4 pt-2 border-t border-purple-100">
                <h3 className="text-lg font-medium text-purple-700 pt-2">
                  Additional Options
                </h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="enable-reminders"
                      className="text-purple-700 font-medium"
                    >
                      Enable Reminders
                    </label>
                    <p className="text-sm text-purple-600">
                      Send reminders before task due date
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BellRing className="h-4 w-4 text-purple-500" />
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="enable-reminders"
                        checked={formData.enableReminders}
                        onChange={(e) =>
                          handleSwitchChange("enableReminders", e)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="require-attachment"
                      className="text-purple-700 font-medium"
                    >
                      Require Attachment
                    </label>
                    <p className="text-sm text-purple-600">
                      User must upload a file when completing task
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileCheck className="h-4 w-4 text-purple-500" />
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="require-attachment"
                        checked={formData.requireAttachment}
                        onChange={(e) =>
                          handleSwitchChange("requireAttachment", e)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview and Submit Buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={generateTasks}
                  className="w-full rounded-md border border-purple-200 bg-purple-50 py-2 px-4 text-purple-700 hover:bg-purple-100 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Preview Generated Tasks
                </button>

                {generatedTasks.length > 0 && (
                  <div className="w-full">
                    <div className="border border-purple-200 rounded-md">
                      <button
                        type="button"
                        onClick={() => setAccordionOpen(!accordionOpen)}
                        className="w-full flex justify-between items-center p-4 text-purple-700 hover:bg-purple-50 focus:outline-none"
                      >
                        <span className="font-medium">
                          {generatedTasks.length} Tasks Generated
                          {formData.frequency === "one-time"
                            ? " (Will be stored in DELEGATION sheet)"
                            : " (Will be stored in Checklist sheet)"
                          }
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform ${accordionOpen ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {accordionOpen && (
                        <div className="p-4 border-t border-purple-200">
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {generatedTasks.slice(0, 20).map((task, index) => (
                              <div
                                key={index}
                                className="text-sm p-2 border rounded-md border-purple-200 bg-purple-50"
                              >
                                <div className="font-medium text-purple-700">
                                  {task.description}
                                </div>
                                <div className="text-xs text-purple-600">
                                  Due: {task.dueDate} | Department: {task.department}
                                </div>
                                <div className="flex space-x-2 mt-1">
                                  {task.enableReminders && (
                                    <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                      <BellRing className="h-3 w-3 mr-1" />{" "}
                                      Reminders
                                    </span>
                                  )}
                                  {task.requireAttachment && (
                                    <span className="inline-flex items-center text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                      <FileCheck className="h-3 w-3 mr-1" />{" "}
                                      Attachment Required
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {generatedTasks.length > 20 && (
                              <div className="text-sm text-center text-purple-600 py-2">
                                ...and {generatedTasks.length - 20} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t border-purple-100">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    department: "",
                    givenBy: sessionStorage.getItem('userFullName') || "",
                    doer: [],
                    description: "",
                    frequency: "daily",
                    enableReminders: true,
                    requireAttachment: false,
                  });
                  setSelectedDate(null);
                  setSelectedDoers([]);
                  setSelectedFile(null);
                  setFilePreview(null);
                  setGeneratedTasks([]);
                  setAccordionOpen(false);
                }}
                className="rounded-md border border-purple-200 py-2 px-4 text-purple-700 hover:border-purple-300 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 py-2 px-4 text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Assigning..." : "Assign Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
