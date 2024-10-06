import logo from "@/assets/icons/logo-full.svg";
import reg_bg from "@/assets/images/register-img.png";

import RegisterForm from "@/components/forms/RegisterForm";
import { getUser } from "@/lib/actions/patient.actions"; 
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Register = () => {
  const { userId } = useParams(); // Extract userId from URL parameters
  const [userData, setUserData] = useState({
    user_id: '',
    username: '',
    phone: '',
    email: ''
  });  // State to store user data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState<string | null>(null); // State to handle errors

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("User ID is required."); 
        setLoading(false);
        return; 
      }
      
      try {
        console.log(userId);
        const data = await getUser(userId); // Call the getUser function with userId
        if (!data) {
          throw new Error('User not found');
        }
        console.log(data);
        setUserData(data); // Set user data to state
      } catch (err) {
        setError((err as Error).message); // Handle error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserData(); // Call the async function
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>Error: {error}</div>; 
  }

  
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <img
            src={logo}
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />

          <RegisterForm user={userData} />

          <p className="copyright py-12">© 2024 CarePluse</p>
        </div>
      </section>

      <img
        src={reg_bg}
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default Register;
