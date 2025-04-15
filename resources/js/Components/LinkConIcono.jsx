export default function LinkConIcono({
  url,
  icon: Icon,
  children = "Entrar al Sitio",
  base64,
}) {
  // Función que convierte un string base64 en un Blob del tipo indicado (PDF por defecto)
  function base64ToBlob(base64String, contentType = "application/pdf") {
    // Si el string incluye el prefijo "data:application/pdf;base64," lo removemos
    const base64Clean = base64String.includes(",")
      ? base64String.split(",")[1]
      : base64String;
    const byteCharacters = atob(base64Clean);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  // Al hacer click, si existe base64 se procede a descargar el PDF
  const handleClick = (e) => {
    if (base64) {
      e.preventDefault();
      const blob = base64ToBlob(base64);
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "perfil.pdf";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }
  };

  return (
    <a
      href={url || "#"}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background h-9 rounded-md px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </a>
  );
}
