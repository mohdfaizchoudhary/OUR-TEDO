
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditCompany.css";
import Side from '../Side/side'
export default function EditCompany() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const id = parseInt(companyId, 10);
  const [form, setForm] = useState({
    company_name: "",
    company_address: "",
    company_type: "",
    major_activity: "",
    services_string: "",
    products_string: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/");

        console.log("Fetching company:", id);

        const res = await axios.get(`http://127.0.0.1:8000/api/companies/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        console.log("Raw company data:", data);

        const nob =
          typeof data.nature_of_business === "string"
            ? JSON.parse(data.nature_of_business)
            : data.nature_of_business || { services: [], products: [] };

        setForm({
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          company_type: data.company_type || "",
          major_activity: data.major_activity || "",
          services_string: nob.services ? nob.services.join(", ") : "",
          products_string: nob.products ? nob.products.join(", ") : "",
        });
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to fetch company details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id, navigate]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate("/");

      const stringToArray = (str) => {
        if (!str) return [];
        return str.split(",")
          .map((s) => s.trim())
          .filter(s => s.length > 0);
      };

      const servicesArray = stringToArray(form.services_string);
      const productsArray = stringToArray(form.products_string);

      if (servicesArray.length === 0 || productsArray.length === 0) {
        alert("Please ensure Services and Products are not empty.");
        return;
      }


      const payload = {
        company_name: form.company_name,
        company_address: form.company_address,
        company_type: form.company_type,
        major_activity: form.major_activity,
        nature_of_business: {
          services: servicesArray,
          products: productsArray,
        },
      };

      console.log("Submitting payload:", payload);

      await axios.put(`http://127.0.0.1:8000/api/companies/${id}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Company updated successfully!");

      console.log("Redirecting to dashboard in 2 seconds...");


      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);

      let errorMsg = "Error updating company.";

      if (err.response && err.response.data) {

        if (err.response.data.major_activity) {
          errorMsg = `Error: Invalid Major Activity (${err.response.data.major_activity[0]})`;
        } else {
          const backendError = err.response.data.detail || err.response.data.error;
          if (backendError) {
            errorMsg = `Error: ${JSON.stringify(backendError)}`;
          }
        }
      }
      alert(errorMsg);
    }
  };

  if (loading) return <p>Loading company data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;


  return (
    <div className="editc-containerc">
      <Side/>

      <div className="editc-cardc">
        <h2 className="textc">Edit Company</h2>
        <form onSubmit={handleSubmit}>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Company Name</label>
            <input
              type="text"
              name="company_name"
              className="formc-inputc"
              value={form.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Company Address</label>
            <input
              type="text"
              name="company_address"
              className="formc-inputc"
              value={form.company_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Company Type</label>
            <select
              name="company_type"
              className="formc-inputc"
              value={form.company_type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- Select Type --</option>
              <option value="PVT_LTD">Pvt. Ltd.</option>
              <option value="LLP">LLP</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="PROPRIETORSHIP">Proprietorship</option>
              <option value="ENTERPRISES">Enterprises</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Major Activity</label>
            <select
              name="major_activity"
              className="formc-inputc"
              value={form.major_activity}
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- Select Activity --</option>
              <option value="MANUFACTURE">Manufacture</option>
              <option value="SERVICES">Services</option>
              <option value="TRADER">Trader</option>
              <option value="RESELLER">Reseller</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="formc-groupc mb-4">
            <label className="formc-labelc">Services (comma-separated)</label>
            <input
              type="text"
              name="services_string"
              className="formc-inputc"
              value={form.services_string}
              onChange={handleChange}
              placeholder="e.g. MANPOWER, CONSULTING"
              required
            />
          </div>


          <div className="formc-groupc mb-6">
            <label className="formc-labelc">Products (comma-separated)</label>
            <input
              type="text"
              name="products_string"
              className="formc-inputc"
              value={form.products_string}
              onChange={handleChange}
              placeholder="e.g. LAPTOP, FURNITURE"
              required
            />
          </div>

          <button type="submit" className="submitc-btnc">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}