import { useRecordings } from "./hooks/useRecordings";
import AuthScreen from "./components/AuthScreen";
import SpeechAnalytics from "./pages/Platform";

export default function App() {
  const { user, signIn, signUp } = useRecordings();
  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  return <SpeechAnalytics />;
}
