import { useState, useEffect, useCallback } from "react";
import logo from "@/assets/icons/logo-full.svg";
import NavbarAdmin from '@/pages/admin/NavbarAdmin';
import DeleteTableNurse from "./DeleteTableNurse";
import AddNurse from "./AddNurse";

const ManageNurse = () => {
  const [nurses, setNurses] = useState([]);

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deleteNursesFetch');
        const data = await response.json();
        setNurses(data);
      } catch (error) {        console.error('Error fetching nurses:', error);
      }
    };
  
    fetchNurses();
    const interval = setInterval(fetchNurses, 2000);
    return () => clearInterval(interval);

  }, []);
  



  const handleDelete = useCallback(async (nurseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deleteNurse/${nurseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete doctor with ID: ${nurseId}`);
      }

      setNurses((prevNurses) => prevNurses.filter((nur) => nur.nurse_id !== nurseId));
      
    } catch (error) {
      console.error('Error deleting nurse:', error);
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
        <h1 className="text-2xl font-bold mb-6">Add Nurse</h1>
        <AddNurse/>
      </div>



      <div className="px-[5%]">
        <h1 className="text-2xl font-bold mb-6">Delete Nurse</h1>
        
        <DeleteTableNurse nurses={nurses} onDelete={handleDelete} />

        {nurses.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No nurses found</p>
        )}
      </div>
    </div>
  );
};

export default ManageNurse;
