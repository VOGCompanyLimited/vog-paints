export default function VOGLogo({ className = '', size = 40 }) {
  return (
    <svg viewBox="0 0 400 200" width={size * 2} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="110" textAnchor="middle" fontFamily="'Georgia', 'Times New Roman', serif" fontSize="76" fontWeight="900" fill="#1e3a5f" letterSpacing="12">
        VOG
      </text>
      <text x="200" y="145" textAnchor="middle" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="12" fontWeight="600" fill="#5a7184" letterSpacing="6">
        COMPANY LIMITED
      </text>
      <text x="200" y="175" textAnchor="middle" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="10" fontWeight="700" fill="#8a9ba8" letterSpacing="5">
        QUALITY &amp; COLOR
      </text>
    </svg>
  );
}
