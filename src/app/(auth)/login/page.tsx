import { redirect } from "next/navigation";

// Auth is now handled via a modal — this route is kept for backward
// compatibility but redirects to home where the modal can be opened.
const LoginPage = () => {
  redirect("/");
};

export default LoginPage;
