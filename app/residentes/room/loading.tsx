export default function Loading() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando sala de asambleas...</p>
        </div>
      </div>
    </div>
  );
}