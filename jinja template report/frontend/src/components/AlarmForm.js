import React, { useState , useEffect} from "react";
import Select from "react-select";

function FormComponent() {
  const [formData, setFormData] = useState({
    template: "",
    duration: "",
    firstShiftTime: "",
    shifts: ""
  });

const [templateOptions, setTemplateOptions] = useState([]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/api/template-names")
    .then((res) => res.json())
    .then((data) => {
      const options = data.templates.map((template) => ({
        value: template,
        label: template,
      }));
      setTemplateOptions(options);

      // Only set default template if it's not already set
      setFormData((prevFormData) => {
        if (!prevFormData.template && options.length > 0) {
          return { ...prevFormData, template: options[0].value };
        }
        return prevFormData;
      });
    });
}, []);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleDurationChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      duration: selectedOption?.value || ""
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append("template", formData.template);
  form.append("duration", formData.duration);
  form.append("first_shift_time", formData.firstShiftTime);
  form.append("shifts_per_day", formData.shifts);

  const response = await fetch("http://127.0.0.1:8000/generate-report", {
    method: "POST",
    body: form
  });

  const html = await response.text();

  const iframe = document.getElementById("report-iframe");
  if (iframe) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    iframe.style.display = "block"; // show the iframe
  }
};

  const options = [
    { value: "24 Hours", label: "24 Hours" },
    { value: "Today", label: "Today" },
    { value: "Yesterday", label: "Yesterday" },
    { value: "Last 7 days", label: "Last 7 Days" },
    { value: "Last 30 days", label: "Last 30 Days" },
    { value: "Last 90 days", label: "Last 90 Days" },
    { value: "Year", label: "Year" },
    { value: "Last Year", label: "Last Year" },




  ];

  const customStyles = {
  option: (provided) => ({
    ...provided,
    padding: 5,
    fontSize: "12px",
    height: "30px"
  }),
  control: (provided) => ({
    ...provided,
    minHeight: "30px",
    fontSize: "12px"
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "12px"
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "150px",  // <-- Set max height for scroll
    overflowY: "auto"
  })
};

  return (
    <div className="card shadow">
  <div className="card-header bg-primary text-white">
    <h5 className="mb-0">Alarm Parameters</h5>
  </div>
  <div className="card-body">
    <form onSubmit={handleSubmit}>
      <div className="row g-3 align-items-end">
        {/* Template Select */}
        <div className="col-md">
          <label className="form-label">Select Template</label>
                    <select
  className="form-select"
  name="template"
  value={formData.template}
  onChange={handleChange}
  required
>
  {templateOptions.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>


        </div>

        {/* Duration Select */}
        <div className="col-md">
          <label htmlFor="duration" className="form-label fw-semibold required">
            Duration
          </label>
          <Select
            id="duration"
            name="duration"
            options={options}
            styles={customStyles}
            value={options.find((opt) => opt.value === formData.duration)}
            onChange={handleDurationChange}
            placeholder="Select Duration"
          />
        </div>

        {/* First Shift Time */}
        <div className="col-md">
          <label className="form-label">First Shift Time</label>
          <input
            type="time"
            className="form-control"
            name="firstShiftTime"
            value={formData.firstShiftTime}
            onChange={handleChange}
            required
          />
        </div>

        {/* Number of Shifts */}
        <div className="col-md">
          <label className="form-label">Number of Shifts</label>
          <input
            type="number"
            className="form-control"
            name="shifts"
            value={formData.shifts}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="col-md-auto">
          <button type="submit" className="btn btn-success w-100">
            Submit
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
  );
}

export default FormComponent;
