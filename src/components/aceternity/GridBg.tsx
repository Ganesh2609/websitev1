import React from "react";

// Define the types for props
interface DotBackgroundProps {
  children?: React.ReactNode;  // Optional children to render within the component
  className?: string;          // Optional className to customize styles
}

export const DotBackground: React.FC<DotBackgroundProps> = ({ children}) => {
  return (
    <div className="h-full w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex justify-center">
              {/* Radial gradient for the container to give a faded look */}
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {/* This is where children will be rendered */}
      {children}
    </div>
  );
};
