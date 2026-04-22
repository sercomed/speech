import { useState } from "react";

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await onSignIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await onSignUp(email, password);
        if (error) throw error;
        setSuccess("¡Cuenta creada! Revisa tu correo para confirmar.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0c10", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif"
    }}>
      <div style={{
        width: 380, background: "#111318", border: "1px solid #1f2530",
        borderRadius: 20, padding: "40px 36px"
      }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#00e5a0", marginBottom: 4 }}>
          🎙 SpeechAI
        </div>
        <div style={{ color: "#5a6275", fontSize: "0.875rem", marginBottom: 32 }}>
          {mode === "login" ? "Inicia sesión en tu cuenta" : "Crea una cuenta nueva"}
        </div>

        {error && (
          <div style={{ background: "rgba(255,101,132,0.1)", border: "1px solid rgba(255,101,132,0.3)",
            color: "#ff6584", padding: "10px 14px", borderRadius: 10, fontSize: "0.83rem", marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.25)",
            color: "#00e5a0", padding: "10px 14px", borderRadius: 10, fontSize: "0.83rem", marginBottom: 16 }}>
            {success}
          </div>
        )}

        <form onSubmit={handle}>
          {["Email", "Contraseña"].map((label, i) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "#8892a4",
                fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                {label}
              </label>
              <input
                type={i === 1 ? "password" : "email"}
                value={i === 0 ? email : password}
                onChange={e => i === 0 ? setEmail(e.target.value) : setPassword(e.target.value)}
                required
                style={{
                  width: "100%", background: "#161a22", border: "1px solid #1f2530",
                  borderRadius: 10, padding: "10px 14px", color: "#e8eaf0",
                  fontSize: "0.875rem", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: "#00e5a0", color: "#0a0c10", border: "none",
            borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            marginTop: 8, fontFamily: "DM Sans, sans-serif"
          }}>
            {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.83rem", color: "#5a6275" }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <span style={{ color: "#00e5a0", cursor: "pointer", fontWeight: 600 }}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}>
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </span>
        </div>
      </div>
    </div>
  );
}
