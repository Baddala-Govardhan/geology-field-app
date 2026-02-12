const ADMIN_KEY = "geology_admin_logged_in";

const getAdminCredentials = () => ({
  username: process.env.REACT_APP_ADMIN_USER || "admin",
  password: process.env.REACT_APP_ADMIN_PASSWORD || "geology2024",
});

export const isAdminLoggedIn = () => {
  return localStorage.getItem(ADMIN_KEY) === "true";
};

export const loginAdmin = (username, password) => {
  const { username: u, password: p } = getAdminCredentials();
  if (username === u && password === p) {
    localStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_KEY);
};
