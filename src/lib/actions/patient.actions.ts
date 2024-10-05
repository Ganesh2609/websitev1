// src/lib/actions/patient.actions.ts

export const createUser = async (user: { username: string; email: string; phone: string; password: string }) => {
  try {
    const response = await fetch("http://localhost:5000/api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Failed to create patient");
    }

    const newPatient = await response.json();
    return newPatient;
  } catch (error) {
    console.error("Error creating patient:", error);
    return null;
  }
};

export const loginUser = async (credentials: { username: string; password: string }) => {
  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const loginData = await response.json(); // Usually, this will be the auth token or user info
    return loginData;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};
