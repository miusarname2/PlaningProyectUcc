export default function ContainerShowData({text, colortext= "text-blue-700", bg ="bg-blue-50"}) {
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 m-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${bg} ${colortext} hover:bg-blue-100`}>
            {text}
        </div>
    )
}