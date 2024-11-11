import { useState, useEffect, useCallback } from "react";
import logo from "@/assets/icons/logo-full.svg";
import NavbarAdmin from '@/pages/admin/NavbarAdmin';
import DeleteTable from "./DeleteTable";
import AddDoctor from "./AddDoctor";

const ManageDoctor = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deleteDoctorsFetch');
        const data = await response.json();
        setDoctors(data);
      } catch (error) {        console.error('Error fetching doctors:', error);
      }
    };
  
    fetchDoctors();
    const interval = setInterval(fetchDoctors, 2000);
    return () => clearInterval(interval);

  }, []);
  



  const handleDelete = useCallback(async (doctorId:any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deleteDoctor/${doctorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete doctor with ID: ${doctorId}`);
      }

      setDoctors((prevDoctors) => prevDoctors.filter((doc:any) => doc.doctor_id !== doctorId));
      
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  }, []);



  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <a href="/">
          <img src={logo} className="h-8 w-fit" alt="logo" />
        </a>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>
      <NavbarAdmin />


      <div className="px-[5%]">
        <h1 className="text-2xl font-bold mb-6">Add Doctor</h1>
        <AddDoctor/>
      </div>



      <div className="px-[5%]">
        <h1 className="text-2xl font-bold mb-6">Delete Doctor</h1>
        
        <DeleteTable doctors={doctors} onDelete={handleDelete} />

        {doctors.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No doctors found</p>
        )}
      </div>
    </div>
  );
};

export default ManageDoctor;
