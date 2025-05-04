export default function HeaderDescription({ icon: Icon, title, description }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    {Icon && <Icon className="h-6 w-6 text-white" />}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <p className="text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    );
}
