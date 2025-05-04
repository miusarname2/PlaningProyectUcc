export default function InfoCard({ icon, iconColor = "text-blue-600", circleColor = "bg-blue-100", text }) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
        <div className={`w-12 h-12 ${circleColor} rounded-full flex items-center justify-center mb-3`}>
          {icon && <span className={`h-6 w-6 ${iconColor}`}>{icon}</span>}
        </div>
        <h3 className="font-medium text-gray-800">{text}</h3>
      </div>
    );
  }