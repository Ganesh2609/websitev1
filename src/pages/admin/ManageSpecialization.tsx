import logo from "@/assets/icons/logo-full.svg";
import NavbarAdmin from '@/pages/admin/NavbarAdmin'


const ManageSpecialization = () => {

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <a href="/">
          <img src={logo} className="h-8 w-fit" alt="logo" />
        </a>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>
      <NavbarAdmin/>
    </div>
  );
};

export default ManageSpecialization;
