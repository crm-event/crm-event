export default function GuestLayout({ title, children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-12">
            <main className="w-full max-w-md rounded-lg bg-white p-8 shadow">
                <h1 className="mb-6 text-xl font-semibold text-gray-900">{title}</h1>
                {children}
            </main>
        </div>
    );
}
